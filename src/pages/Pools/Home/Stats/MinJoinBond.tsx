// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { planckToUnit } from '@polkadotcloud/utils';
import { useApi } from 'contexts/Api';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { Number } from 'library/StatBoxList/Number';
import { useTranslation } from 'react-i18next';

export const MinJoinBondStat = () => {
  const { t } = useTranslation('pages');
  const { network } = useApi();
  const { units } = network;
  const { stats } = usePoolsConfig();

  const params = {
    label: t('pools.minimumToJoinPool'),
    value: planckToUnit(stats.minJoinBond, units).toNumber(),
    decimals: 3,
    unit: ` ${network.unit}`,
    helpKey: 'Minimum To Join Pool',
  };
  return <Number {...params} />;
};
