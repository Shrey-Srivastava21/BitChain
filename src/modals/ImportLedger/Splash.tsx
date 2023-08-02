// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonHelp, ButtonSecondary } from '@polkadotcloud/core-ui';
import { useLedgerHardware } from 'contexts/Hardware/Ledger';
import { useHelp } from 'contexts/Help';
import { useModal } from 'contexts/Modal';
import { useTheme } from 'contexts/Themes';
import { ReactComponent as LogoSVG } from 'img/ledgerLogo.svg';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnyFunction } from 'types';
import { SplashWrapper } from './Wrappers';

export const Splash = ({ handleLedgerLoop }: AnyFunction) => {
  const { t } = useTranslation('modals');
  const {
    getStatusCodes,
    isPaired,
    getIsExecuting,
    setIsExecuting,
    pairDevice,
    getFeedback,
  } = useLedgerHardware();
  const { mode } = useTheme();
  const { openHelp } = useHelp();
  const { replaceModalWith, setResize } = useModal();

  const statusCodes = getStatusCodes();

  const initFetchAddress = async () => {
    const paired = await pairDevice();
    if (paired) {
      setIsExecuting(true);
      handleLedgerLoop();
    }
  };

  const fallbackMessage = t('checking');
  const feedback = getFeedback();
  const helpKey = feedback?.helpKey;

  // Initialise listeners for Ledger IO.
  useEffect(() => {
    if (isPaired !== 'paired') {
      pairDevice();
    }
  }, []);

  // Once the device is paired, start `handleLedgerLoop`.
  useEffect(() => {
    initFetchAddress();
  }, [isPaired]);

  // Resize modal on new message
  useEffect(() => {
    setResize();
  }, [statusCodes, feedback]);

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
      <SplashWrapper>
        <div className="icon">
          <LogoSVG
            style={{ transform: 'scale(0.6)' }}
            opacity={mode === 'dark' ? 0.5 : 0.1}
          />
        </div>

        <div className="content">
          <h2>
            {feedback?.message || fallbackMessage}
            {helpKey ? (
              <ButtonHelp
                marginLeft
                onClick={() => openHelp(helpKey)}
                backgroundSecondary
              />
            ) : null}
          </h2>

          {!getIsExecuting() ? (
            <>
              <h5>{t('ensureLedgerIsConnected')}</h5>
              <div className="button">
                <ButtonSecondary
                  text={
                    statusCodes[0]?.statusCode === 'DeviceNotConnected'
                      ? t('continue')
                      : t('tryAgain')
                  }
                  onClick={async () => initFetchAddress()}
                />
              </div>
            </>
          ) : null}
        </div>
      </SplashWrapper>
    </>
  );
};
