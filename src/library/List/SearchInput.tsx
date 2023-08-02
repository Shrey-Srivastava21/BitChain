// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { SearchInputWrapper } from '.';
import type { SearchInputProps } from './types';

export const SearchInput = ({
  handleChange,
  placeholder,
}: SearchInputProps) => (
  <SearchInputWrapper>
    <input
      type="text"
      className="search searchbox"
      placeholder={placeholder}
      onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e)}
    />
  </SearchInputWrapper>
);
