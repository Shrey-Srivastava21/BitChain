// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { extractUrlValue } from '@polkadotcloud/utils';
import React, { useState } from 'react';

export interface ValidatorsTabsContextInterface {
  setActiveTab: (t: number) => void;
  activeTab: number;
}

export const ValidatorsTabsContext: React.Context<ValidatorsTabsContextInterface> =
  React.createContext({
    // eslint-disable-next-line
    setActiveTab: (t: number) => {},
    activeTab: 0,
  });

export const useValidatorsTabs = () => React.useContext(ValidatorsTabsContext);

export const ValidatorsTabsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const tabFromUrl = extractUrlValue('t');
  const initialActiveTab = [0, 1].includes(Number(tabFromUrl))
    ? Number(tabFromUrl)
    : 0;

  const [activeTab, setActiveTabState] = useState<number>(initialActiveTab);

  const setActiveTab = (t: number) => {
    setActiveTabState(t);
  };

  return (
    <ValidatorsTabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </ValidatorsTabsContext.Provider>
  );
};
