// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { localStorageOrDefault, setStateWithRef } from '@polkadotcloud/utils';
import { PluginsList } from 'consts';
import React, { useRef, useState } from 'react';
import * as defaults from './defaults';
import type { PluginsContextInterface } from './types';

export const PluginsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get initial plugins from local storage.
  const getAvailablePlugins = () => {
    const localPlugins: any = localStorageOrDefault(
      'plugins',
      PluginsList,
      true
    );
    // if fiat is disabled, remove binance_spot service
    const DISABLE_FIAT = Number(import.meta.env.VITE_DISABLE_FIAT ?? 0);
    if (DISABLE_FIAT && localPlugins.includes('binance_spot')) {
      const index = localPlugins.indexOf('binance_spot');
      if (index !== -1) {
        localPlugins.splice(index, 1);
      }
    }
    return localPlugins;
  };

  // Store the currently active plugins.
  const [plugins, setPlugins] = useState<string[]>(getAvailablePlugins());
  const pluginsRef = useRef(plugins);

  // Toggle a plugin.
  const togglePlugin = (key: string) => {
    let localPlugins = [...plugins];
    const found = localPlugins.find((item) => item === key);

    if (found) {
      localPlugins = localPlugins.filter((s) => s !== key);
    } else {
      localPlugins.push(key);
    }

    localStorage.setItem('plugins', JSON.stringify(localPlugins));
    setStateWithRef(localPlugins, setPlugins, pluginsRef);
  };

  // Check if a plugin is currently enabled.
  const pluginEnabled = (key: string) => {
    return pluginsRef.current.includes(key);
  };

  return (
    <PluginsContext.Provider
      value={{
        togglePlugin,
        pluginEnabled,
        plugins: pluginsRef.current,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};

export const PluginsContext = React.createContext<PluginsContextInterface>(
  defaults.defaultPluginsContext
);

export const usePlugins = () => React.useContext(PluginsContext);
