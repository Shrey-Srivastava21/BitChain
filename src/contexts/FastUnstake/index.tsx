// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  greaterThanZero,
  isNotZero,
  rmCommas,
  setStateWithRef,
} from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useNetworkMetrics } from 'contexts/Network';
import { useStaking } from 'contexts/Staking';
import React, { useRef, useState } from 'react';
import type { AnyApi, AnyJson, MaybeAccount } from 'types';
import Worker from 'workers/stakers?worker';
import { useEffectIgnoreInitial } from 'library/Hooks/useEffectIgnoreInitial';
import { defaultFastUnstakeContext, defaultMeta } from './defaults';
import type {
  FastUnstakeContextInterface,
  LocalMeta,
  MetaInterface,
} from './types';

const worker = new Worker();

export const FastUnstakeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { api, isReady, consts, network } = useApi();
  const { activeAccount } = useConnect();
  const { metrics, activeEra } = useNetworkMetrics();
  const { inSetup, getNominationsStatus } = useStaking();
  const { fastUnstakeErasToCheckPerBlock } = metrics;
  const { bondDuration } = consts;
  const nominationStatuses = getNominationsStatus();

  // store whether a fast unstake check is in progress.
  const [checking, setChecking] = useState<boolean>(false);
  const checkingRef = useRef(checking);

  // store whether the account is exposed for fast unstake
  const [isExposed, setIsExposed] = useState<boolean | null>(null);
  const isExposedRef = useRef(isExposed);

  // store state of elibigility checking.
  const [meta, setMeta] = useState<MetaInterface>(defaultMeta);
  const metaRef = useRef(meta);

  // store fastUnstake queue deposit for user.
  const [queueDeposit, setqueueDeposit] = useState<AnyApi>(null);
  const queueDepositRef = useRef(queueDeposit);

  // store fastUnstake head.
  const [head, setHead] = useState<AnyApi>(null);
  const headRef = useRef(head);

  // store fastUnstake counter for queue.
  const [counterForQueue, setCounterForQueue] = useState<number | null>(null);
  const counterForQueueRef = useRef(counterForQueue);

  // store fastUnstake subscription unsub.
  const unsubs = useRef<AnyApi[]>([]);

  // localStorage key to fetch local metadata.
  const getLocalkey = (a: MaybeAccount) => `${network.name}_fast_unstake_${a}`;

  // check until bond duration eras surpasssed.
  const checkToEra = activeEra.index.minus(bondDuration);

  // initiate fast unstake check for accounts that are nominating but not active.
  useEffectIgnoreInitial(() => {
    if (
      isReady &&
      activeAccount &&
      isNotZero(activeEra.index) &&
      fastUnstakeErasToCheckPerBlock > 0
    ) {
      // cancel fast unstake check on network change or account change.
      for (const u of unsubs.current) {
        u();
      }

      setStateWithRef(false, setChecking, checkingRef);
      setStateWithRef(null, setqueueDeposit, queueDepositRef);
      setStateWithRef(null, setCounterForQueue, counterForQueueRef);
      unsubs.current = [];

      // get any existing localStorage records for account.
      const localMeta: LocalMeta | null = getLocalMeta();

      const initialMeta = localMeta
        ? { checked: localMeta.checked }
        : defaultMeta;

      // even if localMeta.isExposed is false, we don't assume a final value until current era +
      // bondDuration is checked.
      let initialIsExposed = null;
      if (localMeta) {
        if (bondDuration.plus(1).isEqualTo(localMeta.checked.length)) {
          initialIsExposed = localMeta.isExposed;
        } else if (localMeta.isExposed === true) {
          initialIsExposed = true;
        } else {
          initialIsExposed = null;
        }
      }

      // checkpoint: initial local meta: localMeta

      setStateWithRef(initialMeta, setMeta, metaRef);
      setStateWithRef(initialIsExposed, setIsExposed, isExposedRef);

      // check for any active nominations
      const activeNominations = Object.entries(nominationStatuses)
        .map(([k, v]: any) => (v === 'active' ? k : false))
        .filter((v) => v !== false);

      // start process if account is inactively nominating & local fast unstake data is not
      // complete.
      if (
        activeAccount &&
        !inSetup() &&
        !activeNominations.length &&
        initialIsExposed === null
      ) {
        // if localMeta existed, start checking from the next era.
        const nextEra = localMeta?.checked.at(-1) || 0;
        const maybeNextEra = localMeta
          ? new BigNumber(nextEra - 1)
          : activeEra.index;

        // checkpoint: check from the possible next era `maybeNextEra`.

        processEligibility(activeAccount, maybeNextEra);
      }

      // subscribe to fast unstake queue immediately if synced in localStorage and still up to date.
      if (initialIsExposed === false) {
        subscribeToFastUnstakeQueue();
      }
    }

    return () => {
      for (const u of unsubs.current) {
        u();
      }
    };
  }, [
    isReady,
    activeAccount,
    network.name,
    activeEra.index,
    inSetup(),
    fastUnstakeErasToCheckPerBlock,
  ]);

  // handle worker message on completed exposure check.
  worker.onmessage = (message: MessageEvent) => {
    if (message) {
      // ensure correct task received
      const { data } = message;
      const { task } = data;
      if (task !== 'process_fast_unstake_era') {
        return;
      }
      // ensure still same conditions.
      const { where, who } = data;
      if (where !== network.name || who !== activeAccount) {
        // checkpoint: conditions have changed, cancel fast unstake.
        return;
      }
      const { currentEra, exposed } = data;

      // ensure checked eras are in order highest first.
      const checked = metaRef.current.checked
        .concat(Number(currentEra))
        .sort((a: number, b: number) => b - a);

      if (!metaRef.current.checked.includes(Number(currentEra))) {
        // update localStorage with updated changes.
        localStorage.setItem(
          getLocalkey(who),
          JSON.stringify({
            isExposed: exposed,
            checked,
          })
        );

        // update check metadata.
        setStateWithRef(
          {
            checked,
          },
          setMeta,
          metaRef
        );
      }

      if (exposed) {
        // checkpoint: 'exposed! Stop checking.

        // cancel checking and update exposed state.
        setStateWithRef(false, setChecking, checkingRef);
        setStateWithRef(true, setIsExposed, isExposedRef);
      } else if (bondDuration.plus(1).isEqualTo(checked.length)) {
        // successfully checked current era - bondDuration eras.
        setStateWithRef(false, setChecking, checkingRef);
        setStateWithRef(false, setIsExposed, isExposedRef);

        // checkpoint: check finished, not exposed.

        // subscribe to fast unstake queue for user and queue counter.
        subscribeToFastUnstakeQueue();
      } else {
        // continue checking the next era.
        checkEra(new BigNumber(currentEra).minus(1));
      }
    }
  };

  // initiate fast unstake eligibility check.
  const processEligibility = async (a: MaybeAccount, era: BigNumber) => {
    // ensure current era has synced
    if (
      era.isLessThan(0) ||
      !greaterThanZero(bondDuration) ||
      !api ||
      !a ||
      checkingRef.current ||
      !activeAccount
    )
      return;

    setStateWithRef(true, setChecking, checkingRef);
    checkEra(era);
  };

  // calls service worker to check exppsures for given era.
  const checkEra = async (era: BigNumber) => {
    if (!api) return;

    // checkpoint: checking era: era

    const exposuresRaw = await api.query.staking.erasStakers.entries(
      era.toString()
    );
    const exposures = exposuresRaw.map(([keys, val]: AnyApi) => ({
      keys: keys.toHuman(),
      val: val.toHuman(),
    }));
    worker.postMessage({
      task: 'process_fast_unstake_era',
      currentEra: era.toString(),
      who: activeAccount,
      where: network.name,
      exposures,
    });
  };

  // subscribe to fastUnstake queue
  const subscribeToFastUnstakeQueue = async () => {
    if (!api || !activeAccount) return;
    const subscribeQueue = async (a: MaybeAccount) => {
      const u = await api.query.fastUnstake.queue(a, (q: AnyApi) =>
        setStateWithRef(
          new BigNumber(rmCommas(q.unwrapOrDefault(0).toString())),
          setqueueDeposit,
          queueDepositRef
        )
      );
      return u;
    };
    const subscribeHead = async () => {
      const u = await api.query.fastUnstake.head((result: AnyApi) => {
        const h = result.unwrapOrDefault(null).toHuman();
        setStateWithRef(h, setHead, headRef);
      });
      return u;
    };
    const subscribeCounterForQueue = async () => {
      const u = await api.query.fastUnstake.counterForQueue(
        (result: AnyApi) => {
          const c = result.toHuman();
          setStateWithRef(c, setCounterForQueue, counterForQueueRef);
        }
      );
      return u;
    };

    // checkpoint: subscribing to queue + head.

    // initiate subscription, add to unsubs.
    await Promise.all([
      subscribeQueue(activeAccount),
      subscribeHead(),
      subscribeCounterForQueue(),
    ]).then((u: any) => {
      unsubs.current = u;
    });
  };

  // gets any existing fast unstake metadata for an account.
  const getLocalMeta = (): LocalMeta | null => {
    let localMeta: AnyJson = localStorage.getItem(getLocalkey(activeAccount));

    if (!localMeta) {
      return null;
    }

    localMeta = JSON.parse(localMeta);

    const localMetaValidated = validateMeta(localMeta);
    if (!localMetaValidated) {
      // remove if not valid.
      localStorage.removeItem(getLocalkey(activeAccount));
      return null;
    }
    // set validated localStorage.
    localStorage.setItem(
      getLocalkey(activeAccount),
      JSON.stringify(localMetaValidated)
    );
    return localMetaValidated;
  };

  // validates stored fast unstake metadata for an account.
  const validateMeta = (localMeta: AnyJson): LocalMeta | null => {
    const localIsExposed = localMeta?.isExposed ?? null;
    let localChecked = localMeta?.checked ?? null;

    // check types saved
    if (typeof localIsExposed !== 'boolean' || !Array.isArray(localChecked)) {
      return null;
    }
    // check checked only contains numbers
    const checkedNumeric = localChecked.every(
      (e: AnyJson) => typeof e === 'number'
    );
    if (!checkedNumeric) {
      return null;
    }

    // remove any expired eras and sort highest first
    localChecked = localChecked
      .filter((e: number) => checkToEra.isLessThan(e))
      .sort((a: number, b: number) => b - a);

    // if no remaining eras, invalid
    if (!localChecked.length) {
      return null;
    }

    // check if highest -> lowest are decremented, no missing eras.
    let i = 0;
    let prev = 0;
    const noMissingEras = localChecked.every((e: number) => {
      i++;
      if (i === 1) {
        prev = e;
        return true;
      }
      const p = prev;
      prev = e;
      if (e === p - 1) return true;
      return false;
    });
    if (!noMissingEras) {
      return null;
    }
    return {
      isExposed: localIsExposed,
      checked: localChecked,
    };
  };

  return (
    <FastUnstakeContext.Provider
      value={{
        getLocalkey,
        checking: checkingRef.current,
        meta: metaRef.current,
        isExposed: isExposedRef.current,
        queueDeposit: queueDepositRef.current,
        head: headRef.current,
        counterForQueue: counterForQueueRef.current,
      }}
    >
      {children}
    </FastUnstakeContext.Provider>
  );
};

export const FastUnstakeContext =
  React.createContext<FastUnstakeContextInterface>(defaultFastUnstakeContext);

export const useFastUnstake = () => React.useContext(FastUnstakeContext);
