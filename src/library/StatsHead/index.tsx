// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ButtonHelp } from '@polkadotcloud/core-ui';
import { useHelp } from 'contexts/Help';
import { Wrapper } from './Wrapper';
import type { StatsHeadProps } from './types';

export const StatsHead = ({ items }: StatsHeadProps) => {
  const { openHelp } = useHelp();

  return (
    <Wrapper>
      {items.map(({ label, value, helpKey }, i) => (
        <div key={`head_stat_${i}`}>
          <div className="inner">
            <h2>{value}</h2>
            <h4>
              {label}
              {!!helpKey && (
                <ButtonHelp marginLeft onClick={() => openHelp(helpKey)} />
              )}
            </h4>
          </div>
        </div>
      ))}
    </Wrapper>
  );
};
