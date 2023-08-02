// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  // PageHeading,
  PageRow,
  PageTitle,
  // RowSection,
} from '@polkadotcloud/core-ui';
// import { planckToUnit } from '@polkadotcloud/utils';
// import BigNumber from 'bignumber.js';
// import { DefaultLocale } from 'consts';
// import { useApi } from 'contexts/Api';
// import { useSubscan } from 'contexts/Subscan';
// import { formatDistance, fromUnixTime, getUnixTime } from 'date-fns';
// import { CardHeaderWrapper, CardWrapper } from 'library/Card/Wrappers';
// import { formatRewardsForGraphs } from 'library/Graphs/Utils';
import { StatBoxList } from 'library/StatBoxList';
// import { SubscanButton } from 'library/SubscanButton';
// import { locales } from 'locale';
// import { ControllerNotStash } from 'pages/Nominate/Active/ControllerNotStash';
// import { useTranslation } from 'react-i18next';
// import { ActiveAccounts } from './ActiveAccounts';
// import { BalanceChart } from './BalanceChart';
// import { BalanceLinks } from './BalanceLinks';
import { NetworkStats } from './NetworkSats';
// import { Payouts } from './Payouts';
// import { StakeStatus } from './StakeStatus';
import { ActiveEraStat } from './Stats/ActiveEraTimeLeft';
import { HistoricalRewardsRateStat } from './Stats/HistoricalRewardsRate';
import { SupplyStakedStat } from './Stats/SupplyStaked';

export const Overview = () => {
  // const { i18n, t } = useTranslation('pages');
  // const { network } = useApi();
  // const { payouts, poolClaims, unclaimedPayouts } = useSubscan();
  // const { units } = network;
  // const { lastReward } = formatRewardsForGraphs(
  //   new Date(),
  //   14,
  //   units,
  //   payouts,
  //   poolClaims,
  //   unclaimedPayouts
  // );

  // const PAYOUTS_HEIGHT = 380;

  // let formatFrom = new Date();
  // let formatTo = new Date();
  // let formatOpts = {};
  // if (lastReward !== null) {
  //   formatFrom = fromUnixTime(
  //     lastReward?.block_timestamp ?? getUnixTime(new Date())
  //   );
  //   formatTo = new Date();
  //   formatOpts = {
  //     addSuffix: true,
  //     locale: locales[i18n.resolvedLanguage ?? DefaultLocale],
  //   };
  // }

  return (
    <>
      <StatBoxList>
        <HistoricalRewardsRateStat />
        <SupplyStakedStat />
        <ActiveEraStat />
      </StatBoxList>
      <PageTitle />
      <PageRow>
        <NetworkStats />
      </PageRow>
    </>
  );
};
