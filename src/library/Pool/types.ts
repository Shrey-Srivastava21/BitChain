// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolAddresses, PoolRoles, PoolState } from 'contexts/Pools/types';

export interface PoolProps {
  pool: Pool;
  batchKey: string;
  batchIndex: number;
}

export interface Pool {
  points: string;
  memberCounter: string;
  addresses: PoolAddresses;
  id: number;
  state: PoolState;
  roles: PoolRoles;
}
