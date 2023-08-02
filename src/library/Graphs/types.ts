// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type BigNumber from 'bignumber.js';
import type { AnySubscan } from 'types';

export interface BondedProps {
  active: BigNumber;
  free: BigNumber;
  unlocking: BigNumber;
  unlocked: BigNumber;
  inactive: boolean;
}

export interface EraPointsProps {
  items: AnySubscan;
  height: number;
}

export interface PayoutBarProps {
  days: number;
  height: string;
}

export interface PayoutLineProps {
  days: number;
  average: number;
  height: string;
  background?: string;
}

export interface StatPieProps {
  value: number;
  value2: number;
}

export interface CardHeaderWrapperProps {
  $withAction?: boolean;
}

export interface CardWrapperProps {
  $flex?: boolean;
  $noPadding?: boolean;
  $transparent?: boolean;
  $warning?: boolean;
  border?: string;
  height?: string | number;
}

export interface PayoutDayCursor {
  amount: BigNumber;
  event_id: string;
}
