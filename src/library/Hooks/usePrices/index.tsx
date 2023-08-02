// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from 'contexts/Api';
import { usePlugins } from 'contexts/Plugins';
import { useUnitPrice } from 'library/Hooks/useUnitPrice';
import { useEffect, useRef, useState } from 'react';

export const usePrices = () => {
  const { network } = useApi();
  const { plugins } = usePlugins();
  const fetchUnitPrice = useUnitPrice();

  const pricesLocalStorage = () => {
    const pricesLocal = localStorage.getItem(`${network.name}_prices`);
    return pricesLocal === null
      ? {
          lastPrice: 0,
          change: 0,
        }
      : JSON.parse(pricesLocal);
  };

  const [prices, _setPrices] = useState(pricesLocalStorage());
  const pricesRef = useRef(prices);

  const setPrices = (p: any) => {
    localStorage.setItem(`${network.name}_prices`, JSON.stringify(p));
    pricesRef.current = {
      ...pricesRef.current,
      ...p,
    };
    _setPrices({
      ...pricesRef.current,
      ...p,
    });
  };

  const initiatePriceInterval = async () => {
    const _prices = await fetchUnitPrice();
    setPrices(_prices);
    if (priceHandle === null) {
      setPriceInterval();
    }
  };

  let priceHandle: any = null;
  const setPriceInterval = async () => {
    priceHandle = setInterval(async () => {
      const _prices = await fetchUnitPrice();
      setPrices(_prices);
    }, 1000 * 30);
  };

  // initial price subscribe
  useEffect(() => {
    initiatePriceInterval();
    return () => {
      if (priceHandle !== null) {
        clearInterval(priceHandle);
      }
    };
  }, []);

  // resubscribe on network toggle
  useEffect(() => {
    if (priceHandle !== null) {
      clearInterval(priceHandle);
    }
    initiatePriceInterval();
  }, [network]);

  // servie toggle
  useEffect(() => {
    if (plugins.includes('binance_spot')) {
      if (priceHandle === null) {
        initiatePriceInterval();
      }
    } else if (priceHandle !== null) {
      clearInterval(priceHandle);
    }
  }, [plugins]);

  return pricesRef.current;
};
