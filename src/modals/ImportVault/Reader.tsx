// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonSecondary } from '@polkadotcloud/core-ui';
import { isValidAddress } from '@polkadotcloud/utils';
import { useConnect } from 'contexts/Connect';
import { useVaultHardware } from 'contexts/Hardware/Vault';
import { useOverlay } from 'contexts/Overlay';
import { QRViewerWrapper } from 'library/Import/Wrappers';
import { QrScanSignature } from 'library/QRCode/ScanSignature';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Reader = () => {
  const { t } = useTranslation('modals');
  const { addToAccounts, formatAccountSs58 } = useConnect();
  const { setStatus: setOverlayStatus } = useOverlay();
  const { addVaultAccount, vaultAccountExists, vaultAccounts } =
    useVaultHardware();

  // Store data from QR Code scanner.
  const [qrData, setQrData] = useState<any>(undefined);

  // Store QR data feedback.
  const [feedback, setFeedback] = useState<string>('');

  const handleQrData = (signature: string) => {
    setQrData(signature.split(':')?.[1] || '');
  };

  const valid =
    isValidAddress(qrData) &&
    !vaultAccountExists(qrData) &&
    !formatAccountSs58(qrData);

  // Reset QR data on open.
  useEffect(() => {
    setQrData(undefined);
  }, []);

  useEffect(() => {
    // Add account and close overlay if valid.
    if (valid) {
      const account = addVaultAccount(qrData, vaultAccounts.length);
      if (account) {
        addToAccounts([account]);
      }
      setOverlayStatus(0);
    }

    // Display feedback.
    setFeedback(
      qrData === undefined
        ? `${t('waitingForQRCode')}`
        : isValidAddress(qrData)
        ? formatAccountSs58(qrData)
          ? `${t('differentNetworkAddress')}`
          : vaultAccountExists(qrData)
          ? `${t('accountAlreadyImported')}`
          : `${t('addressReceived')}`
        : `${t('invalidAddress')}`
    );
  }, [qrData]);

  return (
    <QRViewerWrapper>
      <h3 className="title">{t('scanFromPolkadotVault')}</h3>
      <div className="viewer">
        <QrScanSignature
          size={279}
          onScan={({ signature }) => {
            handleQrData(signature);
          }}
        />
      </div>
      <div className="foot">
        <h3>{feedback}</h3>
        <div>
          <ButtonSecondary
            lg
            text={t('cancel')}
            onClick={() => setOverlayStatus(0)}
          />
        </div>
      </div>
    </QRViewerWrapper>
  );
};
