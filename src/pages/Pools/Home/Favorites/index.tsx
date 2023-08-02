// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PageRow } from '@polkadotcloud/core-ui';
import { useApi } from 'contexts/Api';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { useUi } from 'contexts/UI';
import { CardWrapper } from 'library/Card/Wrappers';
import { PoolList } from 'library/PoolList/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PoolFavorites = () => {
  const { t } = useTranslation('pages');
  const { isReady } = useApi();
  const { favorites, removeFavorite } = usePoolsConfig();
  const { bondedPools } = useBondedPools();
  const { isPoolSyncing } = useUi();

  // store local favorite list and update when favorites list is mutated
  const [favoritesList, setFavoritesList] = useState<any[]>([]);

  useEffect(() => {
    // map favorites to bonded pools
    let _favoritesList = favorites.map((f: any) => {
      const pool = bondedPools.find((b: any) => b.addresses.stash === f);
      if (!pool) {
        removeFavorite(f);
      }
      return pool;
    });

    // filter not found bonded pools
    _favoritesList = _favoritesList.filter((f: any) => f !== undefined);

    setFavoritesList(_favoritesList);
  }, [favorites]);

  return (
    <>
      <PageRow>
        <CardWrapper>
          {favoritesList === null || isPoolSyncing ? (
            <h3>{t('pools.fetchingFavoritePools')}...</h3>
          ) : (
            <>
              {isReady && (
                <>
                  {favoritesList.length > 0 ? (
                    <PoolList
                      batchKey="favorite_pools"
                      pools={favoritesList}
                      title={t('pools.favoritesList')}
                      allowMoreCols
                      pagination
                    />
                  ) : (
                    <h3>{t('pools.noFavorites')}</h3>
                  )}
                </>
              )}
            </>
          )}
        </CardWrapper>
      </PageRow>
    </>
  );
};
