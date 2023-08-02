// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useModal } from 'contexts/Modal';
import { useTranslation } from 'react-i18next';

export const JoinPool = ({
  id,
  setActiveTab,
}: {
  id: number;
  setActiveTab: any;
}) => {
  const { t } = useTranslation('library');
  const { openModalWith } = useModal();

  return (
    <div className="label button-with-text">
      <button
        type="button"
        onClick={() => {
          openModalWith(
            'JoinPool',
            {
              id,
              setActiveTab,
            },
            'small'
          );
        }}
      >
        {t('join')}
        <FontAwesomeIcon icon={faCaretRight} transform="shrink-2" />
      </button>
    </div>
  );
};
