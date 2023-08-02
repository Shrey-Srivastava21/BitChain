// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import type { ActivePool, ActivePoolsContextState } from '../types';

export const nominationStatus = {};

export const poolRoles = {
  depositor: '',
  nominator: '',
  root: '',
  bouncer: '',
};

export const bondedPool = {
  points: '0',
  state: 'Blocked',
  memberCounter: '0',
  roles: null,
};

export const rewardPool = {
  lastRecordedRewardCounter: '0',
  lastRecordedTotalPayouts: '0',
  totalRewardsClaimed: '0',
};

export const selectedActivePool: ActivePool = {
  id: 0,
  addresses: {
    stash: '',
    reward: '',
  },
  bondedPool,
  rewardPool,
  rewardAccountBalance: {},
  pendingRewards: new BigNumber(0),
};

export const targets = {
  nominations: [],
};

export const poolNominations = {
  targets: [],
  submittedIn: 0,
};

export const defaultActivePoolContext: ActivePoolsContextState = {
  isBonding: () => false,
  isNominator: () => false,
  isOwner: () => false,
  isMember: () => false,
  isDepositor: () => false,
  isBouncer: () => false,
  getPoolBondedAccount: () => null,
  getPoolUnlocking: () => [],
  getPoolRoles: () => poolRoles,
  // eslint-disable-next-line
  setTargets: (t) => {},
  getNominationsStatus: () => nominationStatus,
  // eslint-disable-next-line
  setSelectedPoolId: (p) => {},
  selectedActivePool,
  targets,
  poolNominations,
  synced: 'unsynced',
};
