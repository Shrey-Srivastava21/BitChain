// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolRoles } from 'contexts/Pools/types';
import type { ValidatorPrefs } from 'contexts/Validators/types';
import type { AnyJson, BondFor, MaybeAccount, MaybeString } from 'types';

export type PayeeOptions =
  | 'Staked'
  | 'Stash'
  | 'Controller'
  | 'Account'
  | 'None';

export type NominatorSetups = Record<string, NominatorSetup>;

export interface NominatorSetup {
  progress: NominatorProgress;
  section: number;
}

export interface NominatorProgress {
  payee: PayeeConfig;
  nominations: AnyJson[];
  bond: MaybeString;
}

export interface PayeeConfig {
  destination: PayeeOptions | null;
  account: MaybeAccount;
}

export type PoolSetups = Record<string, PoolSetup>;

export interface PoolSetup {
  progress: PoolProgress;
  section: number;
}

export interface PoolProgress {
  metadata: string;
  bond: string;
  nominations: { address: string; prefs: ValidatorPrefs }[];
  roles: PoolRoles | null;
}

export interface SetupContextInterface {
  getSetupProgress: (t: BondFor, a: MaybeAccount) => any;
  removeSetupProgress: (t: BondFor, a: MaybeAccount) => void;
  getNominatorSetupPercent: (a: MaybeAccount) => number;
  getPoolSetupPercent: (a: MaybeAccount) => number;
  setActiveAccountSetup: (
    t: BondFor,
    p: NominatorProgress | PoolProgress
  ) => void;
  setActiveAccountSetupSection: (t: BondFor, s: number) => void;
  setOnNominatorSetup: (v: boolean) => void;
  setOnPoolSetup: (v: boolean) => void;
  onNominatorSetup: boolean;
  onPoolSetup: boolean;
}
