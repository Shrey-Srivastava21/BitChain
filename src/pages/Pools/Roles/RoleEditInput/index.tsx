// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isValidAddress } from '@polkadotcloud/utils';
import { useConnect } from 'contexts/Connect';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wrapper } from './Wrapper';

export const RoleEditInput = ({ setRoleEdit, roleKey, roleEdit }: any) => {
  const { t } = useTranslation('pages');
  const { formatAccountSs58 } = useConnect();

  const processRoleEdit = (newAddress: string) => {
    let edit = {
      newAddress,
      valid: newAddress === '', // empty address is valid and removes the role
      reformatted: false,
    };
    if (isValidAddress(newAddress)) {
      const addressFormatted = formatAccountSs58(newAddress);
      if (addressFormatted) {
        edit = {
          newAddress: addressFormatted,
          valid: true,
          reformatted: true,
        };
      } else {
        edit = { newAddress, valid: true, reformatted: false };
      }
    }
    return { ...roleEdit, ...edit };
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    // set value on key change
    const edit = processRoleEdit(newValue);
    setRoleEdit(roleKey, edit);
  };

  let label;
  let labelClass;
  if (!roleEdit?.valid) {
    label = t('pools.addressInvalid');
    labelClass = 'danger';
  } else if (roleEdit?.reformatted) {
    label = t('pools.reformatted');
    labelClass = 'neutral';
  }

  return (
    <Wrapper>
      <div className="input">
        <section>
          <input
            placeholder={t('pools.address')}
            type="text"
            onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e)}
            value={roleEdit?.newAddress ?? ''}
          />
        </section>
      </div>
      {label && <h5 className={labelClass}>{label}</h5>}
    </Wrapper>
  );
};
