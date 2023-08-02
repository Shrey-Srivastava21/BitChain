// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import {
  ActionItem,
  ButtonSubmitInvert,
  ModalWarnings,
} from '@polkadotcloud/core-ui';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { Warning } from 'library/Form/Warning';
import { useSignerWarnings } from 'library/Hooks/useSignerWarnings';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { SubmitTx } from 'library/SubmitTx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const SetState = ({ setSection, task }: any) => {
  const { t } = useTranslation('modals');
  const { api } = useApi();
  const { setStatus: setModalStatus } = useModal();
  const { activeAccount } = useConnect();
  const { isOwner, isBouncer, selectedActivePool } = useActivePools();
  const { updateBondedPools, getBondedPool } = useBondedPools();
  const { getSignerWarnings } = useSignerWarnings();

  const poolId = selectedActivePool?.id;

  // valid to submit transaction
  const [valid, setValid] = useState<boolean>(false);

  // ensure account has relevant roles for task
  const canToggle =
    (isOwner() || isBouncer()) &&
    ['destroy_pool', 'unlock_pool', 'lock_pool'].includes(task);

  useEffect(() => {
    setValid(canToggle);
  }, [canToggle]);

  const content = (() => {
    let title;
    let message;
    switch (task) {
      case 'destroy_pool':
        title = <ActionItem text={t('setToDestroying')} />;
        message = <p>{t('setToDestroyingSubtitle')}</p>;
        break;
      case 'unlock_pool':
        title = <ActionItem text={t('unlockPool')} />;
        message = <p>{t('unlockPoolSubtitle')}</p>;
        break;
      default:
        title = <ActionItem text={t('lockPool')} />;
        message = <p>{t('lockPoolSubtitle')}</p>;
    }
    return { title, message };
  })();

  const poolStateFromTask = (s: string) => {
    switch (s) {
      case 'destroy_pool':
        return 'Destroying';
      case 'lock_pool':
        return 'Blocked';
      default:
        return 'Open';
    }
  };

  // tx to submit
  const getTx = () => {
    if (!valid || !api) {
      return null;
    }

    let tx;
    switch (task) {
      case 'destroy_pool':
        tx = api.tx.nominationPools.setState(poolId, 'Destroying');
        break;
      case 'unlock_pool':
        tx = api.tx.nominationPools.setState(poolId, 'Open');
        break;
      case 'lock_pool':
        tx = api.tx.nominationPools.setState(poolId, 'Blocked');
        break;
      default:
        tx = null;
    }
    return tx;
  };

  const submitExtrinsic = useSubmitExtrinsic({
    tx: getTx(),
    from: activeAccount,
    shouldSubmit: true,
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {
      // reflect updated state in `bondedPools` list.
      if (
        ['destroy_pool', 'unlock_pool', 'lock_pool'].includes(task) &&
        poolId
      ) {
        const pool = getBondedPool(poolId);
        if (pool) {
          updateBondedPools([
            {
              ...pool,
              state: poolStateFromTask(task),
            },
          ]);
        }
      }
    },
  });

  const warnings = getSignerWarnings(
    activeAccount,
    false,
    submitExtrinsic.proxySupported
  );

  return (
    <>
      <div className="padding">
        {warnings.length > 0 ? (
          <ModalWarnings withMargin>
            {warnings.map((text, i) => (
              <Warning key={`warning${i}`} text={text} />
            ))}
          </ModalWarnings>
        ) : null}
        {content.title}
        {content.message}
      </div>
      <SubmitTx
        valid={valid}
        buttons={[
          <ButtonSubmitInvert
            key="button_back"
            text={t('back')}
            iconLeft={faChevronLeft}
            iconTransform="shrink-1"
            onClick={() => setSection(0)}
          />,
        ]}
        {...submitExtrinsic}
      />
    </>
  );
};
