// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonSubmit, ModalPadding } from '@polkadotcloud/core-ui';
import { useModal } from 'contexts/Modal';
import { usePlugins } from 'contexts/Plugins';
import { Title } from 'library/Modal/Title';
import { useTranslation } from 'react-i18next';

export const DismissTips = () => {
  const { t } = useTranslation('tips');
  const { togglePlugin } = usePlugins();
  const { setStatus } = useModal();

  return (
    <>
      <Title title={t('module.dismissTips')} />
      <ModalPadding horizontalOnly>
        <div
          style={{
            padding: '0 0.5rem 1.25rem 0.5rem',
            width: '100%',
          }}
        >
          <div>
            <h4>{t('module.dismissResult')}</h4>
            <h4>{t('module.reEnable')}</h4>
          </div>
          <div className="buttons">
            <ButtonSubmit
              marginRight
              text={t('module.disableTips')}
              onClick={() => {
                togglePlugin('tips');
                setStatus(2);
              }}
            />
          </div>
        </div>
      </ModalPadding>
    </>
  );
};
