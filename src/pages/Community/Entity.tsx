// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonSecondary, PageHeading, PageRow } from '@polkadotcloud/core-ui';
import { useApi } from 'contexts/Api';
import { useValidators } from 'contexts/Validators';
import { CardWrapper } from 'library/Card/Wrappers';
import { ValidatorList } from 'library/ValidatorList';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Item } from './Item';
import { ItemsWrapper } from './Wrappers';
import { useCommunitySections } from './context';

export const Entity = () => {
  const { t } = useTranslation('pages');
  const { isReady, network } = useApi();
  const { validators: allValidators, removeValidatorMetaBatch } =
    useValidators();
  const { setActiveSection, activeItem } = useCommunitySections();

  const { name, validators: entityAllValidators } = activeItem;
  const validators = entityAllValidators[network.name] ?? [];

  // include validators that exist in `erasStakers`
  const [activeValidators, setActiveValidators] = useState(
    allValidators.filter((v) => validators.includes(v.address))
  );

  useEffect(() => {
    setActiveValidators(
      allValidators.filter((v) => validators.includes(v.address))
    );
  }, [allValidators, network]);

  useEffect(() => {
    removeValidatorMetaBatch(batchKey);
    const newValidators = [...activeValidators];
    setActiveValidators(newValidators);
  }, [name, activeItem, network]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.05,
      },
    },
  };

  const batchKey = 'community_entity_validators';

  return (
    <PageRow>
      <PageHeading>
        <ButtonSecondary
          text={t('community.goBack')}
          iconLeft={faChevronLeft}
          iconTransform="shrink-3"
          onClick={() => setActiveSection(0)}
        />
      </PageHeading>
      <ItemsWrapper variants={container} initial="hidden" animate="show">
        <Item item={activeItem} actionable={false} />
      </ItemsWrapper>
      <CardWrapper>
        {!isReady ? (
          <div className="item">
            <h3>{t('community.connecting')}...</h3>
          </div>
        ) : (
          <>
            {activeValidators.length === 0 && (
              <div className="item">
                <h3>
                  {validators.length
                    ? `${t('community.fetchingValidators')}...`
                    : t('community.noValidators')}
                </h3>
              </div>
            )}
            {activeValidators.length > 0 && (
              <ValidatorList
                bondFor="nominator"
                validators={activeValidators}
                batchKey={batchKey}
                title={`${name} ${t('community.validators')}`}
                selectable={false}
                allowMoreCols
                pagination
                toggleFavorites
                allowFilters
                refetchOnListUpdate
              />
            )}
          </>
        )}
      </CardWrapper>
    </PageRow>
  );
};
