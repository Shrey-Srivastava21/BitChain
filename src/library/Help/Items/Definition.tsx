// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { DefinitionWrapper } from '../Wrappers';

export const Definition = ({ title, description, open: _open }: any) => {
  const [open, setOpen] = useState(_open || false);

  return (
    <DefinitionWrapper>
      <div>
        {!_open ? (
          <button onClick={() => setOpen(!open)} type="button">
            <h2>
              {title}
              <span>{open ? '-' : '+'}</span>
            </h2>
          </button>
        ) : null}
        {open ? (
          <>
            {description.map((item: any, index: number) => (
              <h4 key={`inner_def_${index}`} className="definition">
                {item}
              </h4>
            ))}
          </>
        ) : null}
      </div>
    </DefinitionWrapper>
  );
};
