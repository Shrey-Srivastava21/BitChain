// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ModalPadding } from '@polkadotcloud/core-ui';
import { usePlugins } from 'contexts/Plugins';
import { Title } from 'library/Modal/Title';
import { StatusButton } from 'library/StatusButton';
import { useTranslation } from 'react-i18next';
import { ContentWrapper } from '../Networks/Wrapper';

export const Settings = () => {
  const { plugins, togglePlugin } = usePlugins();
  const { t } = useTranslation('modals');

  // fetch flag to disable fiat
  const DISABLE_FIAT = Number(import.meta.env.VITE_DISABLE_FIAT ?? 0);

  return (
    <>
      <Title title={t('settings')} />
      <ModalPadding>
        <ContentWrapper>
          <h4>{t('togglePlugins')}</h4>
          <StatusButton
            checked={plugins.includes('subscan')}
            label="Subscan API"
            onClick={() => {
              togglePlugin('subscan');
            }}
          />
          {!DISABLE_FIAT && (
            <StatusButton
              checked={plugins.includes('binance_spot')}
              label={t('binanceApi')}
              onClick={() => {
                togglePlugin('binance_spot');
              }}
            />
          )}

          <h4>{t('toggleFeatures')}</h4>

          <StatusButton
            checked={plugins.includes('tips')}
            label={t('dashboardTips')}
            onClick={() => {
              togglePlugin('tips');
            }}
          />
        </ContentWrapper>
      </ModalPadding>
    </>
  );
};
