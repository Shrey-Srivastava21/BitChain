// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StatBoxRow } from '@polkadotcloud/core-ui';
import React from 'react';
import { ListWrapper } from './Wrapper';

export const StatBoxList = ({ children }: { children: React.ReactNode }) => (
  <StatBoxRow>
    <ListWrapper>{children}</ListWrapper>
  </StatBoxRow>
);
