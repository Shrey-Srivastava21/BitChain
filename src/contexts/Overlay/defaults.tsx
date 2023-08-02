// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverlayContextInterface } from './types';

export const defaultOverlayContext: OverlayContextInterface = {
  // eslint-disable-next-line
  openOverlayWith: (o, s) => {},
  closeOverlay: () => {},
  // eslint-disable-next-line
  setStatus: (s) => {},
  // eslint-disable-next-line
  setOverlay: (d) => {},
  size: 'small',
  status: 0,
  Overlay: null,
};
