// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { planckToUnit } from '@polkadotcloud/utils';
import { useApi } from 'contexts/Api';
import { useNetworkMetrics } from 'contexts/Network';
import { Number } from 'library/StatBoxList/Number';
import { useTranslation } from 'react-i18next';

export const MinimumActiveStakeStat = () => {
  const { t } = useTranslation('pages');
  const { network } = useApi();
  const { metrics } = useNetworkMetrics();
  const { minimumActiveStake } = metrics;

  const params = {
    label: t('nominate.minimumToEarnRewards'),
    value: planckToUnit(minimumActiveStake, network.units).toNumber(),
    decimals: 3,
    unit: `${network.unit}`,
    helpKey: 'Bonding',
  };

  return <Number {...params} />;
};
