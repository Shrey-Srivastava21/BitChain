// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Separator } from '@polkadotcloud/core-ui';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { CardWrapper } from 'library/Card/Wrappers';
import { MembershipStatus } from './MembershipStatus';
import { PoolStatus } from './PoolStatus';
import { RewardsStatus } from './RewardsStatus';

export const Status = ({ height }: { height: number }) => {
  const { selectedActivePool } = useActivePools();

  return (
    <CardWrapper height={height}>
      <MembershipStatus />
      <Separator />
      <RewardsStatus />
      {selectedActivePool && (
        <>
          <Separator />
          <PoolStatus />
        </>
      )}
    </CardWrapper>
  );
};
