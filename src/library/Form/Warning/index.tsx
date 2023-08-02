// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { WarningProps } from '../types';
import { Wrapper } from './Wrapper';

export const Warning = ({ text }: WarningProps) => (
  <Wrapper>
    <h4>
      <FontAwesomeIcon icon={faExclamationTriangle} className="icon" />
      {text}
    </h4>
  </Wrapper>
);
