// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonOption } from '@polkadotcloud/core-ui';
import { useConnect } from 'contexts/Connect';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { useTransferOptions } from 'contexts/TransferOptions';
import { Warning } from 'library/Form/Warning';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentWrapper } from './Wrappers';

export const Tasks = forwardRef(({ setSection, setTask }: any, ref: any) => {
  const { t } = useTranslation('modals');
  const { activeAccount } = useConnect();
  const { selectedActivePool, isOwner, isBouncer, isMember, isDepositor } =
    useActivePools();
  const { getTransferOptions } = useTransferOptions();
  const { stats } = usePoolsConfig();
  const { globalMaxCommission } = stats;
  const { active } = getTransferOptions(activeAccount).pool;

  const poolLocked = selectedActivePool?.bondedPool?.state === 'Blocked';
  const poolDestroying = selectedActivePool?.bondedPool?.state === 'Destroying';

  return (
    <ContentWrapper>
      <div className="padding">
        <div className="items" ref={ref} style={{ paddingBottom: '1.5rem' }}>
          <div style={{ paddingBottom: '0.75rem' }}>
            {poolDestroying && <Warning text={t('beingDestroyed')} />}
          </div>
          {isOwner() && (
            <>
              {globalMaxCommission > 0 && (
                <>
                  <ButtonOption
                    onClick={() => {
                      setSection(1);
                      setTask('claim_commission');
                    }}
                  >
                    <div>
                      <h3>{t('claimCommission')}</h3>
                      <p>{t('claimOutstandingCommission')}</p>
                    </div>
                  </ButtonOption>
                  <ButtonOption
                    onClick={() => {
                      setSection(1);
                      setTask('manage_commission');
                    }}
                  >
                    <div>
                      <h3>{t('manageCommission')}</h3>
                      <p>{t('updatePoolCommission')}</p>
                    </div>
                  </ButtonOption>
                </>
              )}
            </>
          )}
          <ButtonOption
            onClick={() => {
              setSection(1);
              setTask('set_claim_permission');
            }}
          >
            <div>
              <h3>{t('updateClaimPermission')}</h3>
              <p>{t('updateWhoClaimRewards')}</p>
            </div>
          </ButtonOption>

          {isOwner() && (
            <ButtonOption
              disabled={poolDestroying}
              onClick={() => {
                setSection(1);
                setTask('set_pool_metadata');
              }}
            >
              <div>
                <h3>{t('renamePool')}</h3>
                <p>{t('updateName')}</p>
              </div>
            </ButtonOption>
          )}
          {(isOwner() || isBouncer()) && (
            <>
              {poolLocked ? (
                <ButtonOption
                  disabled={poolDestroying}
                  onClick={() => {
                    setSection(1);
                    setTask('unlock_pool');
                  }}
                >
                  <div>
                    <h3>{t('unlockPool')}</h3>
                    <p>{t('allowToJoin')}</p>
                  </div>
                </ButtonOption>
              ) : (
                <ButtonOption
                  disabled={poolDestroying}
                  onClick={() => {
                    setSection(1);
                    setTask('lock_pool');
                  }}
                >
                  <div>
                    <h3>{t('lockPool')}</h3>
                    <p>{t('stopJoiningPool')}</p>
                  </div>
                </ButtonOption>
              )}
              <ButtonOption
                disabled={poolDestroying}
                onClick={() => {
                  setSection(1);
                  setTask('destroy_pool');
                }}
              >
                <div>
                  <h3>{t('destroyPool')}</h3>
                  <p>{t('changeToDestroy')}</p>
                </div>
              </ButtonOption>
            </>
          )}
          {isMember() && !isDepositor() && active?.isGreaterThan(0) && (
            <ButtonOption
              onClick={() => {
                setSection(1);
                setTask('leave_pool');
              }}
            >
              <div>
                <h3>{t('leavePool')}</h3>
                <p>{t('unbondFundsLeavePool')}</p>
              </div>
            </ButtonOption>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
});
