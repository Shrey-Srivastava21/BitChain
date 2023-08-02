// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { u8aToString, u8aUnwrapBytes } from '@polkadot/util';
import { clipAddress, remToUnit } from '@polkadotcloud/utils';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { Identicon } from 'library/Identicon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrapper } from './Wrapper';
import type { PoolAccountProps } from './types';

export const PoolAccount = ({
  label,
  pool,
  onClick,
  canClick,
  filled = false,
  fontSize = '1.05rem',
}: PoolAccountProps) => {
  const { t } = useTranslation('library');
  const { isReady } = useApi();
  const { activeAccount } = useConnect();
  const { fetchPoolsMetaBatch, meta } = useBondedPools();

  // is this the initial fetch
  const [fetched, setFetched] = useState(false);

  const batchKey = 'pool_header';

  // refetch when pool or active account changes
  useEffect(() => {
    setFetched(false);
  }, [activeAccount, pool]);

  // configure pool list when network is ready to fetch
  useEffect(() => {
    if (isReady) {
      setFetched(true);

      if (!fetched) {
        getPoolMeta();
      }
    }
  }, [isReady, fetched]);

  // handle pool list bootstrapping
  const getPoolMeta = () => {
    const pools: any = [{ id: pool.id }];
    fetchPoolsMetaBatch(batchKey, pools, true);
  };

  const metaBatch = meta[batchKey];
  const metaData = metaBatch?.metadata?.[0];
  const syncing = metaData === undefined;

  // display value
  const defaultDisplay = clipAddress(pool.addresses.stash);
  let display = syncing ? t('syncing') : metaData ?? defaultDisplay;

  // check if super identity has been byte encoded
  const displayAsBytes = u8aToString(u8aUnwrapBytes(display));
  if (displayAsBytes !== '') {
    display = displayAsBytes;
  }
  // if still empty string, default to clipped address
  if (display === '') {
    display = defaultDisplay;
  }

  return (
    <Wrapper
      $canClick={canClick}
      $filled={filled}
      onClick={onClick}
      fontSize={fontSize}
    >
      {label !== undefined && <div className="account-label">{label}</div>}

      <span className="identicon">
        <Identicon
          value={pool.addresses.stash}
          size={remToUnit(fontSize) * 1.4}
        />
      </span>
      <span className={`title${syncing === true ? ` syncing` : ``}`}>
        {display}
      </span>
    </Wrapper>
  );
};
