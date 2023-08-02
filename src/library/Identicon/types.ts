// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Circle {
  cx: number;
  cy: number;
  fill: string;
  r: number;
}

export interface IdenticonProps {
  size: number;
  clickToCopy?: boolean;
  colors?: string[];
  value: string;
}

export interface Scheme {
  freq: number;
  colors: number[];
}
