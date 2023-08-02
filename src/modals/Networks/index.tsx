// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronRight, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ModalPadding } from '@polkadotcloud/core-ui';
import { capitalizeFirstLetter } from '@polkadotcloud/utils';
import { NetworkList } from 'config/networks';
import { useApi } from 'contexts/Api';
import { useModal } from 'contexts/Modal';
import { Title } from 'library/Modal/Title';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { NetworkName } from 'types';
import { ReactComponent as BraveIconSVG } from '../../img/brave-logo.svg';
import {
  BraveWarning,
  ConnectionButton,
  ConnectionsWrapper,
  ContentWrapper,
  NetworkButton,
} from './Wrapper';

export const Networks = () => {
  const { t } = useTranslation('modals');
  const { switchNetwork, network, isLightClient } = useApi();
  const { setStatus } = useModal();
  const networkKey: string = network.name;

  const [braveBrowser, setBraveBrowser] = useState<boolean>(false);

  useEffect(() => {
    // @ts-ignore
    window.navigator?.brave?.isBrave().then(async (isBrave: boolean) => {
      setBraveBrowser(isBrave);
    });
  });

  return (
    <>
      <Title title={t('networks')} icon={faGlobe} />
      <ModalPadding>
        <ContentWrapper>
          <h4>{t('selectNetwork')}</h4>
          <div className="items">
            {Object.entries(NetworkList).map(
              ([key, item]: any, index: number) => {
                const Svg = item.brand.inline.svg;
                const rpcDisabled = networkKey === key;

                return (
                  <NetworkButton
                    $connected={networkKey === key}
                    disabled={rpcDisabled}
                    key={`network_switch_${index}`}
                    type="button"
                    onClick={() => {
                      if (networkKey !== key) {
                        switchNetwork(key, isLightClient);
                        setStatus(0);
                      }
                    }}
                  >
                    <div style={{ width: '1.75rem' }}>
                      <Svg
                        width={item.brand.inline.size}
                        height={item.brand.inline.size}
                      />
                    </div>
                    <h3>{capitalizeFirstLetter(item.name)}</h3>
                    {networkKey === key && (
                      <h4 className="selected">{t('selected')}</h4>
                    )}
                    <div>
                      <FontAwesomeIcon
                        transform="shrink-2"
                        icon={faChevronRight}
                      />
                    </div>
                  </NetworkButton>
                );
              }
            )}
          </div>
          <h4>{t('connectionType')}</h4>
          <ConnectionsWrapper>
            <ConnectionButton
              $connected={!isLightClient}
              disabled={!isLightClient}
              type="button"
              onClick={() => {
                switchNetwork(networkKey as NetworkName, false);
                setStatus(0);
              }}
            >
              <h3>RPC</h3>
              {!isLightClient && <h4 className="selected">{t('selected')}</h4>}
            </ConnectionButton>
            <ConnectionButton
              $connected={isLightClient}
              className="off"
              type="button"
              onClick={() => {
                switchNetwork(networkKey as NetworkName, true);
                setStatus(0);
              }}
            >
              <h3>{t('lightClient')}</h3>
              {isLightClient && <h4 className="selected">{t('selected')}</h4>}
            </ConnectionButton>
          </ConnectionsWrapper>

          {braveBrowser ? (
            <BraveWarning>
              <BraveIconSVG />
              <div className="brave-text">
                <Trans
                  defaults={t('braveText')}
                  components={{ b: <b />, i: <i /> }}
                />
              </div>
            </BraveWarning>
          ) : null}
        </ContentWrapper>
      </ModalPadding>
    </>
  );
};
