// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isNotZero } from '@polkadotcloud/utils';
import { ListItemsPerBatch, ListItemsPerPage } from 'consts';
import { useApi } from 'contexts/Api';
import { useFilters } from 'contexts/Filters';
import { useNetworkMetrics } from 'contexts/Network';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { useTheme } from 'contexts/Themes';
import { useUi } from 'contexts/UI';
import { motion } from 'framer-motion';
import { Tabs } from 'library/Filter/Tabs';
import { usePoolFilters } from 'library/Hooks/usePoolFilters';
import { Header, List, Wrapper as ListWrapper } from 'library/List';
import { MotionContainer } from 'library/List/MotionContainer';
import { Pagination } from 'library/List/Pagination';
import { SearchInput } from 'library/List/SearchInput';
import { Pool } from 'library/Pool';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePoolList } from './context';
import type { PoolListProps } from './types';

export const PoolList = ({
  allowMoreCols,
  pagination,
  batchKey = '',
  disableThrottle,
  allowSearch,
  pools,
  title,
  defaultFilters,
}: PoolListProps) => {
  const { t } = useTranslation('library');
  const { mode } = useTheme();
  const {
    isReady,
    network: { colors },
  } = useApi();
  const { isSyncing } = useUi();
  const { applyFilter } = usePoolFilters();
  const { activeEra } = useNetworkMetrics();
  const { listFormat, setListFormat } = usePoolList();
  const { getFilters, setMultiFilters, getSearchTerm, setSearchTerm } =
    useFilters();
  const { fetchPoolsMetaBatch, poolSearchFilter, meta } = useBondedPools();

  const includes = getFilters('include', 'pools');
  const excludes = getFilters('exclude', 'pools');
  const searchTerm = getSearchTerm('pools');

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, setRenderIterationState] = useState<number>(1);

  // default list of pools
  const [poolsDefault, setPoolsDefault] = useState(pools);

  // manipulated list (ordering, filtering) of pools
  const [listPools, setListPools] = useState(pools);

  // is this the initial fetch
  const [fetched, setFetched] = useState<boolean>(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    setRenderIterationState(iter);
  };

  // pagination
  const totalPages = Math.ceil(listPools.length / ListItemsPerPage);
  const pageEnd = page * ListItemsPerPage - 1;
  const pageStart = pageEnd - (ListItemsPerPage - 1);

  // render batch
  const batchEnd = Math.min(
    renderIteration * ListItemsPerBatch - 1,
    ListItemsPerPage
  );

  // get throttled subset or entire list
  const poolsToDisplay = disableThrottle
    ? listPools
    : listPools.slice(pageStart).slice(0, ListItemsPerPage);

  // handle pool list bootstrapping
  const setupPoolList = () => {
    setPoolsDefault(pools);
    setListPools(pools);
    setFetched(true);
    fetchPoolsMetaBatch(batchKey, pools, true);
  };

  // handle filter / order update
  const handlePoolsFilterUpdate = (
    filteredPools: any = Object.assign(poolsDefault)
  ) => {
    filteredPools = applyFilter(includes, excludes, filteredPools, batchKey);
    if (searchTerm) {
      filteredPools = poolSearchFilter(filteredPools, batchKey, searchTerm);
    }
    setListPools(filteredPools);
    setPage(1);
    setRenderIteration(1);
  };

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    let filteredPools = Object.assign(poolsDefault);
    filteredPools = applyFilter(includes, excludes, filteredPools, batchKey);
    filteredPools = poolSearchFilter(filteredPools, batchKey, newValue);

    // ensure no duplicates
    filteredPools = filteredPools.filter(
      (value: any, index: number, self: any) =>
        index === self.findIndex((i: any) => i.id === value.id)
    );
    setPage(1);
    setRenderIteration(1);
    setListPools(filteredPools);
    setSearchTerm('pools', newValue);
  };

  // Refetch list when pool list changes.
  useEffect(() => {
    if (pools !== poolsDefault) {
      setFetched(false);
    }
  }, [pools]);

  // Configure pool list when network is ready to fetch.
  useEffect(() => {
    if (isReady && isNotZero(activeEra.index) && !fetched) {
      setupPoolList();
    }
  }, [isReady, fetched, activeEra.index]);

  // Render throttling. Only render a batch of pools at a time.
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 500);
    }
  }, [renderIterationRef.current]);

  // List ui changes / validator changes trigger re-render of list.
  useEffect(() => {
    // only filter when pool nominations have been synced.
    if (!isSyncing && meta[batchKey]?.nominations) {
      handlePoolsFilterUpdate();
    }
  }, [isSyncing, includes, excludes, meta]);

  // Scroll to top of the window on every filter.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [includes, excludes]);

  // Set default filters.
  useEffect(() => {
    if (defaultFilters?.includes?.length) {
      setMultiFilters('include', 'pools', defaultFilters?.includes, false);
    }
    if (defaultFilters?.excludes?.length) {
      setMultiFilters('exclude', 'pools', defaultFilters?.excludes, false);
    }
  }, []);

  return (
    <ListWrapper>
      <Header>
        <div>
          <h4>{title}</h4>
        </div>
        <div>
          <button type="button" onClick={() => setListFormat('row')}>
            <FontAwesomeIcon
              icon={faBars}
              color={listFormat === 'row' ? colors.primary[mode] : 'inherit'}
            />
          </button>
          <button type="button" onClick={() => setListFormat('col')}>
            <FontAwesomeIcon
              icon={faGripVertical}
              color={listFormat === 'col' ? colors.primary[mode] : 'inherit'}
            />
          </button>
        </div>
      </Header>
      <List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
        {allowSearch && poolsDefault.length > 0 && (
          <SearchInput
            handleChange={handleSearchChange}
            placeholder={t('search')}
          />
        )}
        <Tabs
          config={[
            {
              label: t('all'),
              includes: [],
              excludes: [],
            },
            {
              label: t('active'),
              includes: ['active'],
              excludes: ['locked', 'destroying'],
            },
            {
              label: t('locked'),
              includes: ['locked'],
              excludes: [],
            },
            {
              label: t('destroying'),
              includes: ['destroying'],
              excludes: [],
            },
          ]}
          activeIndex={1}
        />
        {pagination && poolsToDisplay.length > 0 && (
          <Pagination page={page} total={totalPages} setter={setPage} />
        )}
        <MotionContainer>
          {poolsToDisplay.length ? (
            <>
              {poolsToDisplay.map((pool: any, index: number) => (
                <motion.div
                  className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
                  key={`nomination_${index}`}
                  variants={{
                    hidden: {
                      y: 15,
                      opacity: 0,
                    },
                    show: {
                      y: 0,
                      opacity: 1,
                    },
                  }}
                >
                  <Pool
                    pool={pool}
                    batchKey={batchKey}
                    batchIndex={poolsDefault.indexOf(pool)}
                  />
                </motion.div>
              ))}
            </>
          ) : (
            <h4 className="none">
              {isSyncing ? `${t('syncingPoolList')}...` : t('noMatch')}
            </h4>
          )}
        </MotionContainer>
      </List>
    </ListWrapper>
  );
};
