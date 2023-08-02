// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { planckToUnit } from '@polkadotcloud/utils';
import { useApi } from 'contexts/Api';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { useUi } from 'contexts/UI';
import { useTranslation } from 'react-i18next';
import type { NominateStatusBarProps } from '../types';
import { Wrapper } from './Wrapper';

export const CreatePoolStatusBar = ({ value }: NominateStatusBarProps) => {
  const { t } = useTranslation('library');
  const { isSyncing } = useUi();
  const { unit, units } = useApi().network;
  const { minCreateBond } = usePoolsConfig().stats;

  const minCreateBondUnit = planckToUnit(minCreateBond, units);
  const sectionClassName =
    value.isGreaterThanOrEqualTo(minCreateBondUnit) && !isSyncing
      ? 'invert'
      : '';

  return (
    <Wrapper>
      <div className="bars">
        <section className={sectionClassName}>
          <h4>&nbsp;</h4>
          <div className="bar">
            <h5>0 {unit}</h5>
          </div>
        </section>
        <section className={sectionClassName}>
          <h4>
            <FontAwesomeIcon icon={faFlag} transform="shrink-4" />
            &nbsp;{t('createPool')}
          </h4>
          <div className="bar">
            <h5>
              {isSyncing
                ? '...'
                : `${minCreateBondUnit.decimalPlaces(3).toFormat()} ${unit}`}
            </h5>
          </div>
        </section>
      </div>
    </Wrapper>
  );
};
