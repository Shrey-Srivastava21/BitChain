// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useModal } from 'contexts/Modal';
import type { MetricsProps } from '../types';

export const Metrics = ({ display, address }: MetricsProps) => {
  const { openModalWith } = useModal();

  return (
    <div className="label">
      <button
        type="button"
        onClick={() =>
          openModalWith(
            'ValidatorMetrics',
            {
              address,
              identity: display,
            },
            'large'
          )
        }
      >
        <FontAwesomeIcon icon={faChartLine} transform="shrink-2" />
      </button>
    </div>
  );
};
