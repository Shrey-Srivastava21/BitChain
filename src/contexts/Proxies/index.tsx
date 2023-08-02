// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { VoidFn } from '@polkadot/api/types';
import {
  addedTo,
  clipAddress,
  localStorageOrDefault,
  matchedProperties,
  removedFrom,
  rmCommas,
  setStateWithRef,
} from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { isSupportedProxy } from 'config/proxies';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import React, { useRef, useState } from 'react';
import type { AnyApi, MaybeAccount } from 'types';
import { useEffectIgnoreInitial } from 'library/Hooks/useEffectIgnoreInitial';
import * as defaults from './defaults';
import type {
  Delegates,
  ProxiedAccounts,
  Proxies,
  ProxiesContextInterface,
  Proxy,
  ProxyDelegate,
} from './type';

export const ProxiesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { api, isReady, network } = useApi();
  const {
    accounts,
    activeProxy,
    setActiveProxy,
    activeAccount,
    addExternalAccount,
  } = useConnect();

  // store the proxy accounts of each imported account.
  const [proxies, setProxies] = useState<Proxies>([]);
  const proxiesRef = useRef(proxies);
  const unsubs = useRef<Record<string, VoidFn>>({});

  // Handle the syncing of accounts on accounts change.
  const handleSyncAccounts = () => {
    // Sync removed accounts.
    const handleRemovedAccounts = () => {
      const removed = removedFrom(accounts, proxiesRef.current, [
        'address',
      ]).map(({ address }) => address);

      removed?.forEach((address) => {
        // if delegates still exist for removed account, re-add the account as a read only system
        // account.
        if (delegatesRef.current[address]) {
          addExternalAccount(address, 'system');
        } else {
          const unsub = unsubs.current[address];
          if (unsub) unsub();
        }
      });

      unsubs.current = Object.fromEntries(
        Object.entries(unsubs.current).filter(([key]) => !removed.includes(key))
      );
    };
    // Sync added accounts.
    const handleAddedAccounts = () => {
      addedTo(accounts, proxiesRef.current, ['address'])?.map(({ address }) =>
        subscribeToProxies(address)
      );
    };
    // Sync existing accounts.
    const handleExistingAccounts = () => {
      setStateWithRef(
        matchedProperties(accounts, proxiesRef.current, ['address']),
        setProxies,
        proxiesRef
      );
    };
    handleRemovedAccounts();
    handleAddedAccounts();
    handleExistingAccounts();
  };

  // store the delegates and the corresponding delegators
  const [delegates, setDelegates] = useState<Delegates>({});
  const delegatesRef = useRef(delegates);

  const subscribeToProxies = async (address: string) => {
    if (!api) return;

    const unsub = await api.queryMulti<AnyApi>(
      [[api.query.proxy.proxies, address]],
      async ([result]) => {
        const data = result.toHuman();
        const newProxies = data[0];
        const reserved = new BigNumber(rmCommas(data[1]));

        if (newProxies.length) {
          setStateWithRef(
            [...proxiesRef.current]
              .filter(({ delegator }) => delegator !== address)
              .concat({
                address,
                delegator: address,
                delegates: newProxies.map((d: AnyApi) => ({
                  delegate: d.delegate.toString(),
                  proxyType: d.proxyType.toString(),
                })),
                reserved,
              }),
            setProxies,
            proxiesRef
          );
        } else {
          // no proxies: remove stale proxies if already in list.
          setStateWithRef(
            [...proxiesRef.current].filter(
              ({ delegator }) => delegator !== address
            ),
            setProxies,
            proxiesRef
          );
        }
      }
    );

    unsubs.current[address] = unsub;
    return unsub;
  };

  // Gets the delegates of the given account
  const getDelegates = (address: MaybeAccount): Proxy | undefined =>
    proxiesRef.current.find(({ delegator }) => delegator === address) ||
    undefined;

  // Gets delegators and proxy types for the given delegate address
  const getProxiedAccounts = (address: MaybeAccount) => {
    const delegate = delegatesRef.current[address || ''];
    if (!delegate) {
      return [];
    }
    const proxiedAccounts: ProxiedAccounts = delegate
      .filter(({ proxyType }) => isSupportedProxy(proxyType))
      .map(({ delegator, proxyType }) => ({
        address: delegator,
        name: clipAddress(delegator),
        proxyType,
      }));
    return proxiedAccounts;
  };

  // Gets the delegates and proxy type of an account, if any.
  const getProxyDelegate = (
    delegator: MaybeAccount,
    delegate: MaybeAccount
  ): ProxyDelegate | null =>
    proxiesRef.current
      .find((p) => p.delegator === delegator)
      ?.delegates.find((d) => d.delegate === delegate) ?? null;

  // Subscribe new accounts to proxies, and remove accounts that are no longer imported.
  useEffectIgnoreInitial(() => {
    if (isReady) {
      handleSyncAccounts();
    }
  }, [accounts, isReady, network]);

  // If active proxy has not yet been set, check local storage `activeProxy` & set it as active
  // proxy if it is the delegate of `activeAccount`.
  useEffectIgnoreInitial(() => {
    const localActiveProxy = localStorageOrDefault(
      `${network.name}_active_proxy`,
      null
    );

    if (!localActiveProxy) {
      setActiveProxy(null);
    } else if (
      proxiesRef.current.length &&
      localActiveProxy &&
      !activeProxy &&
      activeAccount
    ) {
      try {
        const { address, proxyType } = JSON.parse(localActiveProxy);
        // Add proxy address as external account if not imported.
        if (!accounts.find((a) => a.address === address)) {
          addExternalAccount(address, 'system');
        }

        const isActive = (
          proxiesRef.current.find(
            ({ delegator }) => delegator === activeAccount
          )?.delegates || []
        ).find((d) => d.delegate === address && d.proxyType === proxyType);
        if (isActive) {
          setActiveProxy({ address, proxyType });
        }
      } catch (e) {
        // Corrupt local active proxy record. Remove it.
        localStorage.removeItem(`${network.name}_active_proxy`);
      }
    }
  }, [accounts, activeAccount, proxiesRef.current, network]);

  // Reset active proxy state, unsubscribe from subscriptions on network change & unmount.
  useEffectIgnoreInitial(() => {
    setActiveProxy(null, false);
    unsubAll();
    return () => unsubAll();
  }, [network]);

  const unsubAll = () => {
    for (const unsub of Object.values(unsubs.current)) {
      unsub();
    }
    unsubs.current = {};
  };

  // Listens to `proxies` state updates and reformats the data into a list of delegates.
  useEffectIgnoreInitial(() => {
    // Reformat proxiesRef.current into a list of delegates.
    const newDelegates: Delegates = {};
    for (const proxy of proxiesRef.current) {
      const { delegator } = proxy;

      // checking if delegator is not null to keep types happy.
      if (delegator) {
        // get each delegate of this proxy record.
        for (const { delegate, proxyType } of proxy.delegates) {
          const item = {
            delegator,
            proxyType,
          };
          // check if this delegate exists in `newDelegates`.
          if (Object.keys(newDelegates).includes(delegate)) {
            // append delegator to the existing delegate record if it exists.
            newDelegates[delegate].push(item);
          } else {
            // create a new delegate record if it does not yet exist in `newDelegates`.
            newDelegates[delegate] = [item];
          }
        }
      }
    }

    setStateWithRef(newDelegates, setDelegates, delegatesRef);
  }, [proxiesRef.current]);

  // Queries the chain to check if the given delegator & delegate pair is valid proxy.
  const handleDeclareDelegate = async (delegator: string) => {
    if (!api) return [];

    const result: AnyApi = (await api.query.proxy.proxies(delegator)).toHuman();

    let addDelegatorAsExternal = false;
    for (const { delegate: newDelegate } of result[0] || []) {
      if (
        accounts.find(({ address }) => address === newDelegate) &&
        !delegatesRef.current[newDelegate]
      ) {
        subscribeToProxies(delegator);
        addDelegatorAsExternal = true;
      }
    }
    if (addDelegatorAsExternal) {
      addExternalAccount(delegator, 'system');
    }

    return [];
  };

  return (
    <ProxiesContext.Provider
      value={{
        proxies: proxiesRef.current,
        delegates: delegatesRef.current,
        handleDeclareDelegate,
        getDelegates,
        getProxyDelegate,
        getProxiedAccounts,
      }}
    >
      {children}
    </ProxiesContext.Provider>
  );
};

export const ProxiesContext = React.createContext<ProxiesContextInterface>(
  defaults.defaultProxiesContext
);

export const useProxies = () => React.useContext(ProxiesContext);
