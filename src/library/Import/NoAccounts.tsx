// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonSecondary } from '@polkadotcloud/core-ui';
import { useModal } from 'contexts/Modal';
import { useTranslation } from 'react-i18next';
import { NoAccountsWrapper } from './Wrappers';

export const NoAccounts = ({ children, text, Icon }: any) => {
  const { t } = useTranslation('modals');
  const { replaceModalWith } = useModal();

  return (
    <>
      <div style={{ display: 'flex', padding: '1rem' }}>
        <h1>
          <ButtonSecondary
            text={t('back')}
            iconLeft={faChevronLeft}
            iconTransform="shrink-3"
            onClick={async () =>
              replaceModalWith('Connect', { disableScroll: true }, 'large')
            }
          />
        </h1>
      </div>
      <NoAccountsWrapper>
        <Icon className="icon" />
        <h3>{text}</h3>
        {children}
      </NoAccountsWrapper>
    </>
  );
};
