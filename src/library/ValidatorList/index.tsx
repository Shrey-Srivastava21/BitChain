// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isNotZero } from '@polkadotcloud/utils';
import { ListItemsPerBatch, ListItemsPerPage } from 'consts';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useFilters } from 'contexts/Filters';
import { useModal } from 'contexts/Modal';
import { useNetworkMetrics } from 'contexts/Network';
import { StakingContext } from 'contexts/Staking';
import { useTheme } from 'contexts/Themes';
import { useUi } from 'contexts/UI';
import { useValidators } from 'contexts/Validators';
import { motion } from 'framer-motion';
import { Header, List, Wrapper as ListWrapper } from 'library/List';
import { MotionContainer } from 'library/List/MotionContainer';
import { Pagination } from 'library/List/Pagination';
import { SearchInput } from 'library/List/SearchInput';
import { Selectable } from 'library/List/Selectable';
import { Validator } from 'library/ValidatorList/Validator';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useValidatorFilters } from '../Hooks/useValidatorFilters';
import { ListProvider, useList } from '../List/context';
import { Filters } from './Filters';

export const ValidatorListInner = ({
  nominator: initialNominator,
  validators: initialValidators,
  batchKey,
  allowMoreCols,
  allowFilters,
  toggleFavorites,
  pagination,
  title,
  format,
  selectable,
  bondFor,
  onSelected,
  actions = [],
  showMenu = true,
  inModal = false,
  allowSearch = false,
  allowListFormat = true,
  alwaysRefetchValidators = false,
  defaultFilters = undefined,
  disableThrottle = false,
  refetchOnListUpdate = false,
}: any) => {
  const { t } = useTranslation('library');
  const { mode } = useTheme();
  const {
    isReady,
    network: { colors },
  } = useApi();
  const { activeAccount } = useConnect();
  const { activeEra } = useNetworkMetrics();
  const { fetchValidatorMetaBatch } = useValidators();
  const provider = useList();
  const modal = useModal();
  const { isSyncing } = useUi();

  // determine the nominator of the validator list.
  // By default this will be the activeAccount. But for pools,
  // the pool stash address should be the nominator.
  const nominator = initialNominator ?? activeAccount;

  const { selected, listFormat, setListFormat } = provider;

  const {
    getFilters,
    setMultiFilters,
    getOrder,
    getSearchTerm,
    setSearchTerm,
    resetFilters,
    resetOrder,
    clearSearchTerm,
  } = useFilters();
  const { applyFilter, applyOrder, applySearch } = useValidatorFilters();
  const includes = getFilters('include', 'validators');
  const excludes = getFilters('exclude', 'validators');
  const order = getOrder('validators');
  const searchTerm = getSearchTerm('validators');

  const actionsAll = [...actions].filter((action) => !action.onSelected);
  const actionsSelected = [...actions].filter(
    (action: any) => action.onSelected
  );

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, _setRenderIteration] = useState<number>(1);

  // default list of validators
  const [validatorsDefault, setValidatorsDefault] = useState(initialValidators);

  // manipulated list (ordering, filtering) of validators
  const [validators, setValidators]: any = useState(initialValidators);

  // is this the initial fetch
  const [fetched, setFetched] = useState(false);

  // store whether the search bar is being used
  const [isSearching, setIsSearching] = useState(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    _setRenderIteration(iter);
  };

  // pagination
  const totalPages = Math.ceil(validators.length / ListItemsPerPage);
  const pageEnd = page * ListItemsPerPage - 1;
  const pageStart = pageEnd - (ListItemsPerPage - 1);

  // render batch
  const batchEnd = Math.min(
    renderIteration * ListItemsPerBatch - 1,
    ListItemsPerPage
  );

  // reset list when validator list changes
  useEffect(() => {
    if (alwaysRefetchValidators) {
      if (
        JSON.stringify(initialValidators) !== JSON.stringify(validatorsDefault)
      ) {
        setFetched(false);
      }
    } else {
      setFetched(false);
    }
  }, [initialValidators, nominator]);

  // set default filters
  useEffect(() => {
    if (allowFilters) {
      if (defaultFilters?.includes?.length) {
        setMultiFilters(
          'include',
          'validators',
          defaultFilters?.includes,
          false
        );
      }
      if (defaultFilters?.excludes?.length) {
        setMultiFilters(
          'exclude',
          'validators',
          defaultFilters?.excludes,
          false
        );
      }

      return () => {
        resetFilters('exclude', 'validators');
        resetFilters('include', 'validators');
        resetOrder('validators');
        clearSearchTerm('validators');
      };
    }
  }, []);

  // configure validator list when network is ready to fetch
  useEffect(() => {
    if (isReady && isNotZero(activeEra.index) && !fetched) {
      setupValidatorList();
    }
  }, [isReady, activeEra.index, fetched]);

  // render throttle
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 50);
    }
  }, [renderIterationRef.current]);

  // trigger onSelected when selection changes
  useEffect(() => {
    if (onSelected) {
      onSelected(provider);
    }
  }, [selected]);

  // list ui changes / validator changes trigger re-render of list
  useEffect(() => {
    if (allowFilters && fetched) {
      handleValidatorsFilterUpdate();
    }
  }, [order, isSyncing, includes, excludes]);

  // handle modal resize on list format change
  useEffect(() => {
    maybeHandleModalResize();
  }, [listFormat, renderIteration, validators, page]);

  // handle validator list bootstrapping
  const setupValidatorList = () => {
    setValidatorsDefault(initialValidators);
    setValidators(initialValidators);
    setFetched(true);
    fetchValidatorMetaBatch(batchKey, initialValidators, refetchOnListUpdate);
  };

  // handle filter / order update
  const handleValidatorsFilterUpdate = (
    filteredValidators: any = Object.assign(validatorsDefault)
  ) => {
    if (allowFilters) {
      if (order !== 'default') {
        filteredValidators = applyOrder(order, filteredValidators);
      }
      filteredValidators = applyFilter(
        includes,
        excludes,
        filteredValidators,
        batchKey
      );
      if (searchTerm) {
        filteredValidators = applySearch(
          filteredValidators,
          batchKey,
          searchTerm
        );
      }
      setValidators(filteredValidators);
      setPage(1);
      setRenderIteration(1);
    }
  };

  // get validators to render
  let listValidators = [];

  // get throttled subset or entire list
  if (!disableThrottle) {
    listValidators = validators.slice(pageStart).slice(0, batchEnd);
  } else {
    listValidators = validators;
  }

  // if in modal, handle resize
  const maybeHandleModalResize = () => {
    if (!inModal) return;
    modal.setResize();
  };

  const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;

    let filteredValidators = Object.assign(validatorsDefault);
    if (order !== 'default') {
      filteredValidators = applyOrder(order, filteredValidators);
    }
    filteredValidators = applyFilter(
      includes,
      excludes,
      filteredValidators,
      batchKey
    );
    filteredValidators = applySearch(filteredValidators, batchKey, newValue);

    // ensure no duplicates
    filteredValidators = filteredValidators.filter(
      (value: any, index: any, self: any) =>
        index === self.findIndex((i: any) => i.address === value.address)
    );

    setValidators(filteredValidators);
    setPage(1);
    setIsSearching(e.currentTarget.value !== '');
    setRenderIteration(1);
    setSearchTerm('validators', newValue);
  };

  return (
    <ListWrapper>
      <Header>
        <div>
          <h4>
            {title ||
              `${t('displayingValidators', {
                count: validators.length,
              })}`}
          </h4>
        </div>
        <div>
          {allowListFormat === true && (
            <>
              <button type="button" onClick={() => setListFormat('row')}>
                <FontAwesomeIcon
                  icon={faBars}
                  color={
                    listFormat === 'row' ? colors.primary[mode] : 'inherit'
                  }
                />
              </button>
              <button type="button" onClick={() => setListFormat('col')}>
                <FontAwesomeIcon
                  icon={faGripVertical}
                  color={
                    listFormat === 'col' ? colors.primary[mode] : 'inherit'
                  }
                />
              </button>
            </>
          )}
        </div>
      </Header>
      <List $flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
        {allowSearch && (
          <SearchInput
            handleChange={handleSearchChange}
            placeholder={t('searchAddress')}
          />
        )}

        {allowFilters && <Filters />}

        {listValidators.length > 0 && pagination && (
          <Pagination page={page} total={totalPages} setter={setPage} />
        )}

        {selectable ? (
          <Selectable
            canSelect={listValidators.length > 0}
            actionsAll={actionsAll}
            actionsSelected={actionsSelected}
          />
        ) : null}

        <MotionContainer>
          {listValidators.length ? (
            <>
              {listValidators.map((validator: any, index: number) => {
                // fetch batch data by referring to default list index.
                const batchIndex = validatorsDefault.indexOf(validator);

                return (
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
                    <Validator
                      validator={validator}
                      nominator={nominator}
                      toggleFavorites={toggleFavorites}
                      batchIndex={batchIndex}
                      batchKey={batchKey}
                      format={format}
                      showMenu={showMenu}
                      bondFor={bondFor}
                      inModal={inModal}
                    />
                  </motion.div>
                );
              })}
            </>
          ) : (
            <h4 style={{ marginTop: '1rem' }}>
              {isSearching ? t('noValidatorsMatch') : t('noValidators')}
            </h4>
          )}
        </MotionContainer>
      </List>
    </ListWrapper>
  );
};

export const ValidatorList = (props: any) => {
  const { selectActive, selectToggleable } = props;
  return (
    <ListProvider
      selectActive={selectActive}
      selectToggleable={selectToggleable}
    >
      <ValidatorListShouldUpdate {...props} />
    </ListProvider>
  );
};

export class ValidatorListShouldUpdate extends React.Component<any, any> {
  static contextType = StakingContext;

  shouldComponentUpdate(nextProps: any) {
    return this.props.validators !== nextProps.validators;
  }

  render() {
    return <ValidatorListInner {...this.props} />;
  }
}
