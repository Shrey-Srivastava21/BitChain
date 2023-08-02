// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import {
  extractUrlValue,
  makeCancelable,
  rmCommas,
  varToUrlHash,
} from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { NetworkList } from 'config/networks';
import {
  DefaultNetwork,
  FallbackBondingDuration,
  FallbackEpochDuration,
  FallbackExpectedBlockTime,
  FallbackMaxElectingVoters,
  FallbackMaxNominations,
  FallbackNominatorRewardedPerValidator,
  FallbackSessionsPerEra,
} from 'consts';
import type {
  APIChainState,
  APIConstants,
  APIContextInterface,
  ApiStatus,
  NetworkState,
} from 'contexts/Api/types';
import React, { useEffect, useState } from 'react';
import type { AnyApi, NetworkName } from 'types';
import { useEffectIgnoreInitial } from 'library/Hooks/useEffectIgnoreInitial';
import * as defaults from './defaults';

export const APIProvider = ({ children }: { children: React.ReactNode }) => {
  // Get the initial network and prepare meta tags if necessary.
  const getInitialNetwork = () => {
    const urlNetworkRaw = extractUrlValue('n');

    const urlNetworkValid = !!Object.values(NetworkList).find(
      (n) => n.name === urlNetworkRaw
    );

    // use network from url if valid.
    if (urlNetworkValid) {
      const urlNetwork = urlNetworkRaw as NetworkName;

      if (urlNetworkValid) {
        return urlNetwork;
      }
    }
    // fallback to localStorage network if there.
    const localNetwork: NetworkName = localStorage.getItem(
      'network'
    ) as NetworkName;
    const localNetworkValid = !!Object.values(NetworkList).find(
      (n) => n.name === localNetwork
    );
    return localNetworkValid ? localNetwork : DefaultNetwork;
  };

  // handle network switching
  const switchNetwork = async (name: NetworkName, lightClient: boolean) => {
    // disconnect api if there is an existing connection.
    if (api) {
      await api.disconnect();
      setApi(null);
    }
    // handle local light client flag.
    if (lightClient) {
      localStorage.setItem('light_client', lightClient ? 'true' : '');
    } else {
      localStorage.removeItem('light_client');
    }

    setNetwork({
      name,
      meta: NetworkList[name],
    });

    // handle light client state, which will trigger dynamic Sc import.
    setIsLightClient(lightClient);

    // update url `n` if needed.
    varToUrlHash('n', name, false);

    // if not light client, directly connect. Otherwise, `connect` is called after dynamic import of
    // Sc.
    if (!lightClient) {
      setApiStatus('connecting');
      connectProvider(name);
    }
  };

  // Store povider instance.
  const [provider, setProvider] = useState<WsProvider | ScProvider | null>(
    null
  );

  // Store chain state.
  const [chainState, setchainState] = useState<APIChainState>(undefined);

  // Store whether in light client mode.
  const [isLightClient, setIsLightClient] = useState<boolean>(
    !!localStorage.getItem('light_client')
  );

  // API instance state.
  const [api, setApi] = useState<ApiPromise | null>(null);

  // Store the initial active network.
  const initialNetwork = getInitialNetwork();
  const [network, setNetwork] = useState<NetworkState>({
    name: initialNetwork,
    meta: NetworkList[initialNetwork],
  });

  // Store network constants.
  const [consts, setConsts] = useState<APIConstants>(defaults.consts);

  // Store API connection status.
  const [apiStatus, setApiStatus] = useState<ApiStatus>('disconnected');

  // Handle an initial RPC connection.
  useEffect(() => {
    if (!provider && !isLightClient) {
      connectProvider(getInitialNetwork());
    }
  });

  // Handle light client connection.
  const handleLightClientConnection = async (Sc: AnyApi) => {
    const newProvider = new ScProvider(
      Sc,
      NetworkList[network.name].endpoints.lightClient
    );
    connectProvider(network.name, newProvider);
  };

  // Dynamically load `Sc` when user opts to use light client.
  useEffectIgnoreInitial(() => {
    if (isLightClient) {
      setApiStatus('connecting');
      const { promise: ScPromise, cancel } = makeCancelable(
        import('@substrate/connect')
      );
      ScPromise.then((Sc) => {
        handleLightClientConnection(Sc);
      });
      return () => {
        cancel?.();
      };
    }
  }, [isLightClient, network.name]);

  // Initialise provider event handlers when provider is set.
  useEffectIgnoreInitial(() => {
    if (provider) {
      provider.on('connected', () => {
        setApiStatus('connected');
      });
      provider.on('error', () => {
        setApiStatus('disconnected');
      });
      getChainState();
    }
  }, [provider]);

  // Fetch chain state. Called once `provider` has been initialised.
  const getChainState = async () => {
    if (!provider) return;

    // initiate new api and set connected.
    const newApi = await ApiPromise.create({ provider });

    // set connected here in case event listeners have not yet initialised.
    setApiStatus('connected');

    const newChainState = await Promise.all([
      newApi.rpc.system.chain(),
      newApi.rpc.system.version(),
      newApi.consts.system.ss58Prefix,
    ]);

    // check that chain values have been fetched before committing to state.
    // could be expanded to check supported chains.
    if (
      newChainState.every((c) => {
        return !!c?.toHuman();
      })
    ) {
      const chain = newChainState[0]?.toString();
      const version = newChainState[1]?.toString();
      const ss58Prefix = Number(newChainState[2]?.toString());

      // set fetched chain state in storage.
      setchainState({ chain, version, ss58Prefix });
    }

    // store active network in localStorage.
    // NOTE: this should ideally refer to above `chain` value.
    localStorage.setItem('network', String(network.name));

    // Assume chain state is correct and bootstrap network consts.
    connectedCallback(newApi);
  };

  // connection callback. Called once `provider` and `api` have been initialised.
  const connectedCallback = async (newApi: ApiPromise) => {
    // fetch constants.
    const result = await Promise.all([
      newApi.consts.staking.bondingDuration,
      newApi.consts.staking.maxNominations,
      newApi.consts.staking.sessionsPerEra,
      newApi.consts.staking.maxNominatorRewardedPerValidator,
      newApi.consts.electionProviderMultiPhase.maxElectingVoters,
      newApi.consts.babe.expectedBlockTime,
      newApi.consts.babe.epochDuration,
      newApi.consts.balances.existentialDeposit,
      newApi.consts.staking.historyDepth,
      newApi.consts.fastUnstake.deposit,
      newApi.consts.nominationPools.palletId,
    ]);

    // format constants.
    const bondDuration = result[0]
      ? new BigNumber(rmCommas(result[0].toString()))
      : FallbackBondingDuration;

    const maxNominations = result[1]
      ? new BigNumber(rmCommas(result[1].toString()))
      : FallbackMaxNominations;

    const sessionsPerEra = result[2]
      ? new BigNumber(rmCommas(result[2].toString()))
      : FallbackSessionsPerEra;

    const maxNominatorRewardedPerValidator = result[3]
      ? new BigNumber(rmCommas(result[3].toString()))
      : FallbackNominatorRewardedPerValidator;

    const maxElectingVoters = result[4]
      ? new BigNumber(rmCommas(result[4].toString()))
      : FallbackMaxElectingVoters;

    const expectedBlockTime = result[5]
      ? new BigNumber(rmCommas(result[5].toString()))
      : FallbackExpectedBlockTime;

    const epochDuration = result[6]
      ? new BigNumber(rmCommas(result[6].toString()))
      : FallbackEpochDuration;

    const existentialDeposit = result[7]
      ? new BigNumber(rmCommas(result[7].toString()))
      : new BigNumber(0);

    const historyDepth = result[8]
      ? new BigNumber(rmCommas(result[8].toString()))
      : new BigNumber(0);

    const fastUnstakeDeposit = result[9]
      ? new BigNumber(rmCommas(result[9].toString()))
      : new BigNumber(0);

    const poolsPalletId = result[10] ? result[10].toU8a() : new Uint8Array(0);

    setConsts({
      bondDuration,
      maxNominations,
      sessionsPerEra,
      maxNominatorRewardedPerValidator,
      historyDepth,
      maxElectingVoters,
      epochDuration,
      expectedBlockTime,
      poolsPalletId,
      existentialDeposit,
      fastUnstakeDeposit,
    });
    setApi(newApi);
  };

  // connect function sets provider and updates active network.
  const connectProvider = async (name: NetworkName, lc?: ScProvider) => {
    const { endpoints } = NetworkList[name];
    const newProvider = lc || new WsProvider(endpoints.rpc);
    if (lc) {
      await newProvider.connect({ forceEmbeddedNode: true });
    }
    setProvider(newProvider);
  };

  return (
    <APIContext.Provider
      value={{
        switchNetwork,
        api,
        consts,
        chainState,
        isReady: apiStatus === 'connected' && api !== null,
        network: network.meta,
        apiStatus,
        isLightClient,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export const APIContext = React.createContext<APIContextInterface>(
  defaults.defaultApiContext
);

export const useApi = () => React.useContext(APIContext);
