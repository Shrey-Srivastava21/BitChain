// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ButtonSubmitInvert, ModalWarnings } from '@polkadotcloud/core-ui';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useActivePools } from 'contexts/Pools/ActivePools';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import type { ClaimPermission } from 'contexts/Pools/types';
import { ClaimPermissionInput } from 'library/Form/ClaimPermissionInput';
import { Warning } from 'library/Form/Warning';
import { useSignerWarnings } from 'library/Hooks/useSignerWarnings';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { SubmitTx } from 'library/SubmitTx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const SetClaimPermission = ({ setSection, section }: any) => {
  const { t } = useTranslation('modals');
  const { api } = useApi();
  const { setStatus: setModalStatus } = useModal();
  const { activeAccount } = useConnect();
  const { isOwner, isMember } = useActivePools();
  const { getSignerWarnings } = useSignerWarnings();
  const { membership } = usePoolMemberships();

  // Valid to submit transaction.
  const [valid, setValid] = useState<boolean>(false);

  // Updated claim permission value.
  const [claimPermission, setClaimPermission] = useState<
    ClaimPermission | undefined
  >(membership?.claimPermission);

  // Determine current pool metadata and set in state.
  useEffect(() => {
    const current = membership?.claimPermission;
    if (current) {
      setClaimPermission(membership?.claimPermission);
    }
  }, [section, membership]);

  useEffect(() => {
    setValid(isOwner() || (isMember() && claimPermission !== undefined));
  }, [isOwner(), isMember()]);

  // tx to submit.
  const getTx = () => {
    if (!valid || !api) {
      return null;
    }
    return api.tx.nominationPools.setClaimPermission(claimPermission);
  };

  const submitExtrinsic = useSubmitExtrinsic({
    tx: getTx(),
    from: activeAccount,
    shouldSubmit: true,
    callbackSubmit: () => {
      setModalStatus(2);
    },
    callbackInBlock: () => {},
  });

  const warnings = getSignerWarnings(
    activeAccount,
    false,
    submitExtrinsic.proxySupported
  );

  return (
    <>
      <div className="padding">
        {warnings.length > 0 ? (
          <ModalWarnings withMargin>
            {warnings.map((text, i) => (
              <Warning key={`warning${i}`} text={text} />
            ))}
          </ModalWarnings>
        ) : null}

        <ClaimPermissionInput
          current={membership?.claimPermission}
          permissioned={
            ![undefined, 'Permissioned'].includes(membership?.claimPermission)
          }
          onChange={(val: ClaimPermission | undefined) => {
            setClaimPermission(val);
          }}
        />
      </div>
      <SubmitTx
        valid={valid && claimPermission !== membership?.claimPermission}
        buttons={[
          <ButtonSubmitInvert
            key="button_back"
            text={t('back')}
            iconLeft={faChevronLeft}
            iconTransform="shrink-1"
            onClick={() => setSection(0)}
          />,
        ]}
        {...submitExtrinsic}
      />
    </>
  );
};
