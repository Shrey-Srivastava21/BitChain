// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTooltip } from 'contexts/Tooltip';
import { useValidators } from 'contexts/Validators';
import { TooltipTrigger } from 'library/ListItem/Wrappers';
import { useTranslation } from 'react-i18next';
import type { ParaValidatorProps } from '../types';

export const ParaValidator = ({ address }: ParaValidatorProps) => {
  const { t } = useTranslation('library');
  const { sessionParachain } = useValidators();
  const { setTooltipTextAndOpen } = useTooltip();

  const tooltipText = t('validatingParachainBlocks');

  if (!sessionParachain?.includes(address || '')) {
    return <></>;
  }

  return (
    <div className="label">
      <TooltipTrigger
        className="tooltip-trigger-element"
        data-tooltip-text={tooltipText}
        onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
      />
      <FontAwesomeIcon icon={faCubes} transform="shrink-1" />
    </div>
  );
};
