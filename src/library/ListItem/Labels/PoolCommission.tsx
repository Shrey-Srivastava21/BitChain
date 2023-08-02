// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTooltip } from 'contexts/Tooltip';
import { TooltipTrigger } from 'library/ListItem/Wrappers';
import { useTranslation } from 'react-i18next';

export const PoolCommission = ({ commission }: { commission: string }) => {
  const { t } = useTranslation('library');
  const { setTooltipTextAndOpen } = useTooltip();

  const tooltipText = t('poolCommission');

  if (!commission) {
    return null;
  }

  return (
    <div className="label">
      <TooltipTrigger
        className="tooltip-trigger-element"
        data-tooltip-text={tooltipText}
        onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
      />
      {commission}
    </div>
  );
};
