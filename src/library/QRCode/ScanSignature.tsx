// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';
import { QrScan } from './Scan.js';
import type { ScanSignatureProps } from './types.js';

const ScanSignature = ({
  className,
  onError,
  onScan,
  size,
  style,
}: ScanSignatureProps): React.ReactElement<ScanSignatureProps> => {
  const _onScan = useCallback(
    (signature: string | null) =>
      signature && onScan({ signature: `0x${signature}` }),
    [onScan]
  );

  return (
    <QrScan
      className={className}
      onError={onError}
      onScan={_onScan}
      size={size}
      style={style}
    />
  );
};

export const QrScanSignature = React.memo(ScanSignature);
