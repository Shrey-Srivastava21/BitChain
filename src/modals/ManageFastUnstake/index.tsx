// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  ActionItem,
  ModalNotes,
  ModalPadding,
  ModalWarnings,
} from '@polkadotcloud/core-ui';
import { planckToUnit } from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { useApi } from 'contexts/Api';
import { useBonded } from 'contexts/Bonded';
import { useConnect } from 'contexts/Connect';
import { useFastUnstake } from 'contexts/FastUnstake';
import { useModal } from 'contexts/Modal';
import { useNetworkMetrics } from 'contexts/Network';
import { useTransferOptions } from 'contexts/TransferOptions';
import { Warning } from 'library/Form/Warning';
import { useSignerWarnings } from 'library/Hooks/useSignerWarnings';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { useUnstaking } from 'library/Hooks/useUnstaking';
import { Close } from 'library/Modal/Close';
import { SubmitTx } from 'library/SubmitTx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ManageFastUnstake = () => {
  const { t } = useTranslation('modals');
  const { api, consts, network } = useApi();
  const { activeAccount } = useConnect();
  const { getBondedAccount } = useBonded();
  const { activeEra, metrics } = useNetworkMetrics();
  const { isExposed, counterForQueue, queueDeposit, meta } = useFastUnstake();
  const { setResize, setStatus } = useModal();
  const { feeReserve, getTransferOptions } = useTransferOptions();
  const { isFastUnstaking } = useUnstaking();
  const { getSignerWarnings } = useSignerWarnings();

  const { bondDuration, fastUnstakeDeposit } = consts;
  const { fastUnstakeErasToCheckPerBlock } = metrics;
  const { checked } = meta;
  const controller = getBondedAccount(activeAccount);
  const allTransferOptions = getTransferOptions(activeAccount);
  const { nominate, freeBalance } = allTransferOptions;
  const { totalUnlockChuncks } = nominate;

  const enoughForDeposit = freeBalance
    .minus(feeReserve)
    .isGreaterThanOrEqualTo(fastUnstakeDeposit);

  // valid to submit transaction
  const [valid, setValid] = useState<boolean>(false);

  useEffect(() => {
    setValid(
      fastUnstakeErasToCheckPerBlock > 0 &&
        ((!isFastUnstaking &&
          enoughForDeposit &&
          isExposed === false &&
          totalUnlockChuncks === 0) ||
          isFastUnstaking)
    );
  }, [
    isExposed,
    fastUnstakeErasToCheckPerBlock,
    totalUnlockChuncks,
    isFastUnstaking,
    fastUnstakeDeposit,
    freeBalance,
    feeReserve,
  ]);

  useEffect(() => {
    setResize();
  }, [isExposed, queueDeposit, isFastUnstaking]);

  // tx to submit
  const getTx = () => {
    let tx = null;
    if (!valid || !api) {
      return tx;
    }
    if (!isFastUnstaking) {
      tx = api.tx.fastUnstake.registerFastUnstake();
    } else {
      tx = api.tx.fastUnstake.deregister();
    }
    return tx;
  };

  const submitExtrinsic = useSubmitExtrinsic({
    tx: getTx(),
    from: controller,
    shouldSubmit: valid,
    callbackSubmit: () => {},
    callbackInBlock: () => {
      setStatus(2);
    },
  });

  // warnings
  const warnings = getSignerWarnings(
    activeAccount,
    true,
    submitExtrinsic.proxySupported
  );

  if (!isFastUnstaking) {
    if (!enoughForDeposit) {
      warnings.push(
        `${t('noEnough')} ${planckToUnit(
          fastUnstakeDeposit,
          network.units
        ).toString()} ${network.unit}`
      );
    }

    if (totalUnlockChuncks > 0) {
      warnings.push(
        `${t('fastUnstakeWarningUnlocksActive', {
          count: totalUnlockChuncks,
        })} ${t('fastUnstakeWarningUnlocksActiveMore')}`
      );
    }
  }

  // manage last exposed
  const lastExposedAgo = !isExposed
    ? new BigNumber(0)
    : activeEra.index.minus(checked[0] || 0);

  const erasRemaining = BigNumber.max(1, bondDuration.minus(lastExposedAgo));

  return (
    <>
      <Close />
      <ModalPadding>
        <h2 className="title unbounded">
          {t('fastUnstake', { context: 'title' })}
        </h2>
        {warnings.length > 0 ? (
          <ModalWarnings withMargin>
            {warnings.map((text, i) => (
              <Warning key={`warning_${i}`} text={text} />
            ))}
          </ModalWarnings>
        ) : null}

        {isExposed ? (
          <>
            <ActionItem
              text={t('fastUnstakeExposedAgo', {
                count: lastExposedAgo.toNumber(),
              })}
            />
            <ModalNotes>
              <p>
                {t('fastUnstakeNote1', {
                  bondDuration: bondDuration.toString(),
                })}
              </p>
              <p>
                {t('fastUnstakeNote2', { count: erasRemaining.toNumber() })}
              </p>
            </ModalNotes>
          </>
        ) : (
          <>
            {!isFastUnstaking ? (
              <>
                <ActionItem text={t('fastUnstake', { context: 'register' })} />
                <ModalNotes>
                  <p>
                    <>
                      {t('registerFastUnstake')}{' '}
                      {planckToUnit(
                        fastUnstakeDeposit,
                        network.units
                      ).toString()}{' '}
                      {network.unit}. {t('fastUnstakeOnceRegistered')}
                    </>
                  </p>
                  <p>
                    {t('fastUnstakeCurrentQueue')}: <b>{counterForQueue}</b>
                  </p>
                </ModalNotes>
              </>
            ) : (
              <>
                <ActionItem text={t('fastUnstakeRegistered')} />
                <ModalNotes>
                  <p>
                    {t('fastUnstakeCurrentQueue')}: <b>{counterForQueue}</b>
                  </p>
                  <p>{t('fastUnstakeUnorderedNote')}</p>
                </ModalNotes>
              </>
            )}
          </>
        )}
      </ModalPadding>
      {!isExposed ? (
        <SubmitTx
          fromController
          valid={valid}
          submitText={
            submitExtrinsic.submitting
              ? t('submitting')
              : t('fastUnstakeSubmit', {
                  context: isFastUnstaking ? 'cancel' : 'register',
                })
          }
          {...submitExtrinsic}
        />
      ) : null}
    </>
  );
};
