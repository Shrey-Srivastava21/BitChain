// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { localStorageOrDefault, setStateWithRef } from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import type {
  ActivePool,
  ActivePoolsContextState,
  PoolAddresses,
} from 'contexts/Pools/types';
import { useStaking } from 'contexts/Staking';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AnyApi, AnyJson, Sync } from 'types';
import { useEffectIgnoreInitial } from 'library/Hooks/useEffectIgnoreInitial';
import { useApi } from '../../Api';
import { useConnect } from '../../Connect';
import { useBondedPools } from '../BondedPools';
import { usePoolMemberships } from '../PoolMemberships';
import { usePoolsConfig } from '../PoolsConfig';
import * as defaults from './defaults';

export const ActivePoolsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { eraStakers } = useStaking();
  const { activeAccount } = useConnect();
  const { api, network, isReady } = useApi();
  const { membership } = usePoolMemberships();
  const { createAccounts } = usePoolsConfig();
  const { getAccountPools, bondedPools } = useBondedPools();

  // determine active pools to subscribe to.
  const accountPools = useMemo(() => {
    const newAccountPools = Object.keys(getAccountPools(activeAccount) || {});
    const p = membership?.poolId ? String(membership.poolId) : '-1';

    if (membership?.poolId && !newAccountPools.includes(p || '-1')) {
      newAccountPools.push(String(membership.poolId));
    }
    return newAccountPools;
  }, [activeAccount, bondedPools, membership]);

  // stores member's active pools
  const [activePools, setActivePools] = useState<ActivePool[]>([]);
  const activePoolsRef = useRef(activePools);

  // store active pools unsubs
  const unsubActivePools = useRef<AnyApi[]>([]);

  // store active pools nominations.
  const [poolNominations, setPoolNominations] = useState<
    Record<number, AnyJson>
  >({});
  const poolNominationsRef = useRef(poolNominations);

  // store pool nominations unsubs
  const unsubNominations = useRef<AnyApi[]>([]);

  // store account target validators
  const [targets, setTargetsState] = useState<Record<number, AnyJson>>({});
  const targetsRef = useRef(targets);

  // store whether active pool data has been synced.
  // this will be true if no active pool exists for the active account.
  // We just need confirmation this is the case.
  const [synced, setSynced] = useState<Sync>('unsynced');
  const syncedRef = useRef(synced);

  // store the currently selected active pool for the UI.
  // Should default to the membership pool (if present).
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  const getActivePoolMembership = () =>
    // get the activePool that the active account
    activePoolsRef.current.find((a) => {
      const p = membership?.poolId ? String(membership.poolId) : '0';
      return String(a.id) === p;
    }) || null;
  const getSelectedActivePool = () =>
    activePoolsRef.current.find((a) => a.id === Number(selectedPoolId)) || null;

  const getSelectedPoolNominations = () =>
    poolNominationsRef.current[Number(selectedPoolId) ?? -1] ||
    defaults.poolNominations;

  const getSelectedPoolTargets = () =>
    targetsRef.current[Number(selectedPoolId) ?? -1] || defaults.targets;

  // handle active pool subscriptions
  const handlePoolSubscriptions = async () => {
    if (accountPools.length) {
      Promise.all(accountPools.map((p) => subscribeToActivePool(Number(p))));
    } else {
      setStateWithRef('synced', setSynced, syncedRef);
    }

    // assign default pool immediately if active pool not currently selected
    const defaultSelected = membership?.poolId || accountPools[0] || null;
    const activePoolSelected =
      activePoolsRef.current.find(
        (a) => String(a.id) === String(selectedPoolId)
      ) || null;

    if (defaultSelected && !activePoolSelected) {
      setSelectedPoolId(String(defaultSelected));
    }
  };

  // unsubscribe and reset poolNominations
  const unsubscribePoolNominations = () => {
    if (unsubNominations.current.length) {
      for (const unsub of unsubNominations.current) {
        unsub();
      }
    }
    setStateWithRef({}, setPoolNominations, poolNominationsRef);
    unsubNominations.current = [];
  };

  // unsubscribe and reset activePool and poolNominations
  const unsubscribeActivePools = () => {
    if (unsubActivePools.current.length) {
      for (const unsub of unsubActivePools.current) {
        unsub();
      }
      setStateWithRef([], setActivePools, activePoolsRef);
      unsubActivePools.current = [];
    }
  };

  const subscribeToActivePool = async (poolId: number) => {
    if (!api) {
      return;
    }

    const addresses: PoolAddresses = createAccounts(poolId);

    // new active pool subscription
    const subscribeActivePool = async (id: number) => {
      const unsub = await api.queryMulti<AnyApi>(
        [
          [api.query.nominationPools.bondedPools, id],
          [api.query.nominationPools.rewardPools, id],
          [api.query.system.account, addresses.reward],
        ],
        async ([bondedPool, rewardPool, accountData]): Promise<void> => {
          const balance = accountData.data;
          bondedPool = bondedPool?.unwrapOr(undefined)?.toHuman();
          rewardPool = rewardPool?.unwrapOr(undefined)?.toHuman();
          if (rewardPool && bondedPool) {
            const rewardAccountBalance = balance?.free;

            const pendingRewards = await fetchPendingRewards();

            const pool = {
              id,
              addresses,
              bondedPool,
              rewardPool,
              rewardAccountBalance,
              pendingRewards,
            };

            // set active pool state, removing the pool if it already exists first.
            setStateWithRef(
              [...activePoolsRef.current.filter((a) => a.id !== pool.id), pool],
              setActivePools,
              activePoolsRef
            );

            // get pool target nominations and set in state
            const newTargets = localStorageOrDefault(
              `${addresses.stash}_pool_targets`,
              defaults.targets,
              true
            );

            // add or replace current pool targets in targetsRef
            const newPoolTargets = { ...targetsRef.current };
            newPoolTargets[poolId] = newTargets;

            // set pool staking targets
            setStateWithRef(newPoolTargets, setTargetsState, targetsRef);

            // subscribe to pool nominations
            subscribeToPoolNominations(poolId, addresses.stash);
          } else {
            // set default targets for pool
            const newPoolTargets = { ...targetsRef.current };
            newPoolTargets[poolId] = defaults.targets;
            setStateWithRef(newPoolTargets, setTargetsState, targetsRef);
          }
        }
      );
      return unsub;
    };

    // initiate subscription, add to unsubs.
    await Promise.all([subscribeActivePool(poolId)]).then((unsubs: any) => {
      unsubActivePools.current = unsubActivePools.current.concat(unsubs);
    });
  };

  const subscribeToPoolNominations = async (
    poolId: number,
    poolBondAddress: string
  ) => {
    if (!api) return;
    const subscribePoolNominations = async (bondedAddress: string) => {
      const unsub = await api.query.staking.nominators(
        bondedAddress,
        (nominations: AnyApi) => {
          // set pool nominations
          let newNominations = nominations.unwrapOr(null);
          if (newNominations === null) {
            newNominations = defaults.poolNominations;
          } else {
            newNominations = {
              targets: newNominations.targets.toHuman(),
              submittedIn: newNominations.submittedIn.toHuman(),
            };
          }

          // add or replace current pool nominations in poolNominations
          const newPoolNominations = { ...poolNominationsRef.current };
          newPoolNominations[poolId] = newNominations;

          // set pool nominations state
          setStateWithRef(
            newPoolNominations,
            setPoolNominations,
            poolNominationsRef
          );
        }
      );
      return unsub;
    };

    // initiate subscription, add to unsubs.
    await Promise.all([subscribePoolNominations(poolBondAddress)]).then(
      (unsubs) => {
        unsubNominations.current = unsubNominations.current.concat(unsubs);
      }
    );
  };

  // Utility functions
  /*
   * updateActivePoolPendingRewards
   * A helper function to set the unclaimed rewards of an active pool.
   */
  const updateActivePoolPendingRewards = (
    pendingRewards: BigNumber,
    poolId: number
  ) => {
    if (!poolId) return;

    // update the active pool the account is a member of.
    setStateWithRef(
      [...activePoolsRef.current].map((a) =>
        a.id === poolId
          ? {
              ...a,
              pendingRewards,
            }
          : a
      ),
      setActivePools,
      activePoolsRef
    );
  };

  /*
   * setTargets
   * Sets currently selected pool's target validators in storage.
   */
  const setTargets = (newTargets: any) => {
    if (!selectedPoolId) {
      return;
    }

    const stashAddress = getPoolBondedAccount();
    if (stashAddress) {
      localStorage.setItem(
        `${stashAddress}_pool_targets`,
        JSON.stringify(newTargets)
      );
      // inject targets into targets object
      const newPoolTargets = { ...targetsRef.current };
      newPoolTargets[Number(selectedPoolId)] = newTargets;

      setStateWithRef(newPoolTargets, setTargetsState, targetsRef);
    }
  };

  /*
   * isBonding
   * Returns whether active pool exists
   */
  const isBonding = () => !!getSelectedActivePool();

  /*
   * isNominator
   * Returns whether the active account is
   * the nominator in the active pool.
   */
  const isNominator = () => {
    const roles = getSelectedActivePool()?.bondedPool?.roles;
    if (!activeAccount || !roles) {
      return false;
    }
    return activeAccount === roles?.nominator;
  };

  /*
   * isOwner
   * Returns whether the active account is
   * the owner of the active pool.
   */
  const isOwner = () => {
    const roles = getSelectedActivePool()?.bondedPool?.roles;
    if (!activeAccount || !roles) {
      return false;
    }
    return activeAccount === roles?.root;
  };

  /*
   * isMember
   * Returns whether the active account is
   * a member of the active pool.
   */
  const isMember = () => {
    const selectedPool = getSelectedActivePool();
    const p = selectedPool ? String(selectedPool.id) : '-1';
    return String(membership?.poolId || '') === p;
  };

  /*
   * isDepositor
   * Returns whether the active account is
   * the depositor of the active pool.
   */
  const isDepositor = () => {
    const roles = getSelectedActivePool()?.bondedPool?.roles;
    if (!activeAccount || !roles) {
      return false;
    }
    return activeAccount === roles?.depositor;
  };

  /*
   * isBouncer
   * Returns whether the active account is
   * the depositor of the active pool.
   */
  const isBouncer = () => {
    const roles = getSelectedActivePool()?.bondedPool?.roles;
    if (!activeAccount || !roles) {
      return false;
    }
    return activeAccount === roles?.bouncer;
  };

  /*
   * getPoolBondedAccount
   * get the stash address of the bonded pool
   * that the member is participating in.
   */
  const getPoolBondedAccount = () =>
    getSelectedActivePool()?.addresses?.stash || null;

  /*
   * Get the status of nominations.
   * Possible statuses: waiting, inactive, active.
   */
  const getNominationsStatus = () => {
    const nominations = getSelectedPoolNominations().nominations?.targets || [];
    const statuses: Record<string, string> = {};

    for (const nomination of nominations) {
      const s = eraStakers.stakers.find(
        ({ address }) => address === nomination
      );

      if (s === undefined) {
        statuses[nomination] = 'waiting';
        continue;
      }
      const exists = (s.others ?? []).find(
        ({ who }: any) => who === activeAccount
      );
      if (exists === undefined) {
        statuses[nomination] = 'inactive';
        continue;
      }
      statuses[nomination] = 'active';
    }
    return statuses;
  };

  /*
   * getPoolRoles
   * Returns the active pool's roles or a default roles object.
   */
  const getPoolRoles = () => {
    return getSelectedActivePool()?.bondedPool?.roles || defaults.poolRoles;
  };

  const getPoolUnlocking = () => {
    const membershipPoolId = membership?.poolId
      ? String(membership.poolId)
      : '-1';

    // exit early if the currently selected pool is not membership pool
    if (selectedPoolId !== membershipPoolId) {
      return [];
    }
    return membership?.unlocking || [];
  };

  // Fetch and update unclaimed rewards from runtime call.
  const fetchPendingRewards = async () => {
    if (getActivePoolMembership() && membership && api && isReady) {
      const pendingRewards = await api.call.nominationPoolsApi.pendingRewards(
        membership?.address || ''
      );
      return new BigNumber(pendingRewards?.toString() || 0);
    }
    return new BigNumber(0);
  };

  // Fetch and update pending rewards when membership changes.
  const updatePendingRewards = async () => {
    const pendingRewards = await fetchPendingRewards();

    updateActivePoolPendingRewards(
      pendingRewards,
      getActivePoolMembership()?.id || 0
    );
  };

  // re-sync when number of accountRoles change.
  // this can happen when bondedPools sync, when roles
  // are edited within the dashboard, or when pool
  // membership changes.
  useEffectIgnoreInitial(() => {
    unsubscribeActivePools();
    unsubscribePoolNominations();
    setStateWithRef('unsynced', setSynced, syncedRef);
  }, [activeAccount, accountPools.length]);

  // subscribe to pool that the active account is a member of.
  useEffectIgnoreInitial(() => {
    if (isReady && syncedRef.current === 'unsynced') {
      setStateWithRef('syncing', setSynced, syncedRef);
      handlePoolSubscriptions();
    }
  }, [network, isReady, syncedRef.current]);

  // unsubscribe all on component unmount
  useEffect(
    () => () => {
      unsubscribeActivePools();
      unsubscribePoolNominations();
    },
    [network]
  );

  // re-calculate pending rewards when membership changes
  useEffectIgnoreInitial(() => {
    updatePendingRewards();
  }, [
    network,
    isReady,
    getActivePoolMembership()?.bondedPool,
    getActivePoolMembership()?.rewardPool,
    membership,
  ]);

  // when we are subscribed to all active pools, syncing is considered
  // completed.
  useEffectIgnoreInitial(() => {
    if (unsubNominations.current.length === accountPools.length) {
      setStateWithRef('synced', setSynced, syncedRef);
    }
  }, [accountPools, unsubNominations.current]);

  return (
    <ActivePoolsContext.Provider
      value={{
        isNominator,
        isOwner,
        isMember,
        isDepositor,
        isBouncer,
        isBonding,
        getPoolBondedAccount,
        getPoolUnlocking,
        getPoolRoles,
        setTargets,
        getNominationsStatus,
        setSelectedPoolId,
        synced: syncedRef.current,
        selectedActivePool: getSelectedActivePool(),
        targets: getSelectedPoolTargets(),
        poolNominations: getSelectedPoolNominations(),
      }}
    >
      {children}
    </ActivePoolsContext.Provider>
  );
};

export const ActivePoolsContext = React.createContext<ActivePoolsContextState>(
  defaults.defaultActivePoolContext
);

export const useActivePools = () => React.useContext(ActivePoolsContext);
