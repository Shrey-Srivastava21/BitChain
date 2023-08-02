// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkList } from 'config/networks';
import { ApiEndpoints } from 'consts';
import { useApi } from 'contexts/Api';

export const useUnitPrice = () => {
  const { network } = useApi();

  const fetchUnitPrice = async () => {
    const urls = [
      `${ApiEndpoints.priceChange}${NetworkList[network.name].api.priceTicker}`,
    ];

    const responses = await Promise.all(
      urls.map((u) => fetch(u, { method: 'GET' }))
    );
    const texts = await Promise.all(responses.map((res) => res.json()));
    const newPrice = texts[0];

    if (
      newPrice.lastPrice !== undefined &&
      newPrice.priceChangePercent !== undefined
    ) {
      const price: string = (Math.ceil(newPrice.lastPrice * 100) / 100).toFixed(
        2
      );

      return {
        lastPrice: price,
        change: (Math.round(newPrice.priceChangePercent * 100) / 100).toFixed(
          2
        ),
      };
    }
    return null;
  };

  return fetchUnitPrice;
};
