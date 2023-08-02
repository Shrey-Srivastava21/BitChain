// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigNumber from 'bignumber.js';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useTransferOptions } from 'contexts/TransferOptions';
import { useEffect, useMemo, useState } from 'react';
import type { BondFor } from 'types';

interface Props {
  bondFor: BondFor;
}

export const useBondGreatestFee = ({ bondFor }: Props) => {
  const { api } = useApi();
  const { activeAccount } = useConnect();
  const { feeReserve, getTransferOptions } = useTransferOptions();
  const transferOptions = useMemo(
    () => getTransferOptions(activeAccount),
    [activeAccount]
  );
  const { freeBalance } = transferOptions;

  // store the largest possible tx fees for bonding.
  const [largestTxFee, setLargestTxFee] = useState<BigNumber>(new BigNumber(0));

  // update max tx fee on free balance change
  useEffect(() => {
    handleFetch();
  }, [transferOptions]);

  // handle fee fetching
  const handleFetch = async () => {
    const largestFee = await txLargestFee();
    setLargestTxFee(largestFee);
  };

  // estimate the largest possible tx fee based on users free balance.
  const txLargestFee = async () => {
    const bond = freeBalance.minus(feeReserve).toString();

    let tx = null;
    if (!api) {
      return new BigNumber(0);
    }
    if (bondFor === 'pool') {
      tx = api.tx.nominationPools.bondExtra({
        FreeBalance: bond,
      });
    } else if (bondFor === 'nominator') {
      tx = api.tx.staking.bondExtra(bond);
    }

    if (tx) {
      const { partialFee } = await tx.paymentInfo(activeAccount || '');
      return new BigNumber(partialFee.toString());
    }
    return new BigNumber(0);
  };

  return largestTxFee;
};
