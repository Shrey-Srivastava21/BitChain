// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useConnect } from 'contexts/Connect';
import { useSetup } from 'contexts/Setup';
import { Footer } from 'library/SetupSteps/Footer';
import { Header } from 'library/SetupSteps/Header';
import { MotionContainer } from 'library/SetupSteps/MotionContainer';
import type { SetupStepProps } from 'library/SetupSteps/types';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Roles } from '../../Roles';

export const PoolRoles = ({ section }: SetupStepProps) => {
  const { t } = useTranslation('pages');
  const { activeAccount } = useConnect();
  const { getSetupProgress, setActiveAccountSetup } = useSetup();
  const setup = getSetupProgress('pool', activeAccount);
  const { progress } = setup;

  // if no roles in setup already, inject `activeAccount` to be
  // root and depositor roles.
  const initialValue = progress.roles ?? {
    root: activeAccount,
    depositor: activeAccount,
    nominator: activeAccount,
    bouncer: activeAccount,
  };

  // store local pool name for form control
  const [roles, setRoles] = useState({
    roles: initialValue,
  });

  // pool name valid
  const [rolesValid, setRolesValid] = useState<boolean>(true);

  // handler for updating pool roles
  const handleSetupUpdate = (value: any) => {
    setActiveAccountSetup('pool', value);
  };

  // update pool roles on account change
  useEffect(() => {
    setRoles({
      roles: initialValue,
    });
  }, [activeAccount]);

  // apply initial pool roles to setup progress
  useEffect(() => {
    // only update if this section is currently active
    if (setup.section === section) {
      setActiveAccountSetup('pool', {
        ...progress,
        roles: initialValue,
      });
    }
  }, [setup.section]);

  return (
    <>
      <Header
        thisSection={section}
        complete={progress.roles !== null}
        title={t('pools.roles')}
        helpKey="Pool Roles"
        bondFor="pool"
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        <h4 className="withMargin">
          <Trans defaults={t('pools.poolCreator')} components={{ b: <b /> }} />
        </h4>
        <h4 className="withMargin">
          <Trans
            defaults={t('pools.assignedToAnyAccount')}
            components={{ b: <b /> }}
          />
        </h4>
        <Roles
          batchKey="pool_roles_create"
          listenIsValid={setRolesValid}
          defaultRoles={initialValue}
          setters={[
            {
              set: handleSetupUpdate,
              current: progress,
            },
            {
              set: setRoles,
              current: roles,
            },
          ]}
        />
        <Footer complete={rolesValid} bondFor="pool" />
      </MotionContainer>
    </>
  );
};
