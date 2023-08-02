// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronLeft, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ButtonPrimaryInvert } from '@polkadotcloud/core-ui';
import { camelize } from '@polkadotcloud/utils';
import { HelpConfig } from 'config/help';
import { DefaultLocale } from 'consts';
import { useHelp } from 'contexts/Help';
import type {
  DefinitionWithKeys,
  ExternalItems,
  HelpItem,
} from 'contexts/Help/types';
import { useAnimation } from 'framer-motion';
import { useFillVariables } from 'library/Hooks/useFillVariables';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Definition } from './Items/Definition';
import { External } from './Items/External';
import { ContentWrapper, HeightWrapper, Wrapper } from './Wrappers';

export const Help = () => {
  const { t, i18n } = useTranslation('help');
  const { setStatus, status, definition, closeHelp, setDefinition } = useHelp();
  const controls = useAnimation();
  const { fillVariables } = useFillVariables();

  const onFadeIn = useCallback(async () => {
    await controls.start('visible');
  }, []);

  const onFadeOut = useCallback(async () => {
    await controls.start('hidden');
    setStatus(0);
  }, []);

  const variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };

  useEffect(() => {
    // help has been opened - fade in
    if (status === 1) {
      onFadeIn();
    }
    // an external component triggered closure - fade out
    if (status === 2) {
      onFadeOut();
    }
  }, [status]);

  // render early if help not open
  if (status === 0) return <></>;

  let meta: HelpItem | undefined;

  if (definition) {
    // get items for active category
    meta = Object.values(HelpConfig).find(
      (c) => c?.definitions?.find((d) => d === definition)
    );
  } else {
    // get all items
    let _definitions: string[] = [];
    let _external: ExternalItems = [];

    Object.values(HelpConfig).forEach((c) => {
      _definitions = _definitions.concat([...(c.definitions || [])]);
      _external = _external.concat([...(c.external || [])]);
    });
    meta = { definitions: _definitions, external: _external };
  }

  let definitions = meta?.definitions ?? [];

  const activeDefinitions = definitions
    .filter((d) => d !== definition)
    .map((d) => {
      const localeKey = camelize(d);

      return fillVariables(
        {
          title: t(`definitions.${localeKey}.0`),
          description: i18n.getResource(
            i18n.resolvedLanguage ?? DefaultLocale,
            'help',
            `definitions.${localeKey}.1`
          ),
        },
        ['title', 'description']
      );
    });

  // get active definiton
  const activeRecord = definition
    ? definitions.find((d) => d === definition)
    : null;

  let activeDefinition: DefinitionWithKeys | null = null;
  if (activeRecord) {
    const localeKey = camelize(activeRecord);

    const title = t(`definitions.${localeKey}.0`);
    const description = i18n.getResource(
      i18n.resolvedLanguage ?? DefaultLocale,
      'help',
      `definitions.${localeKey}.1`
    );

    activeDefinition = fillVariables(
      {
        title,
        description,
      },
      ['title', 'description']
    );

    // filter active definition
    definitions = definitions.filter((d: string) => d !== definition);
  }

  // accumulate external resources
  const externals = meta?.external ?? [];
  const activeExternals = externals.map((e) => {
    const localeKey = e[0];
    const url = e[1];
    const website = e[2];

    return {
      title: t(`externals.${localeKey}`),
      url,
      website,
    };
  });

  return (
    <Wrapper
      initial={{
        opacity: 0,
      }}
      animate={controls}
      transition={{
        duration: 0.25,
      }}
      variants={variants}
    >
      <div>
        <HeightWrapper>
          <ContentWrapper>
            <div className="buttons">
              {definition && (
                <ButtonPrimaryInvert
                  lg
                  text={t('modal.allResources')}
                  iconLeft={faChevronLeft}
                  onClick={() => setDefinition(null)}
                />
              )}
              <ButtonPrimaryInvert
                lg
                text={t('modal.close')}
                iconLeft={faTimes}
                onClick={() => closeHelp()}
              />
            </div>
            <h1>
              {activeDefinition
                ? `${activeDefinition.title}`
                : `${t('modal.helpResources')}`}
            </h1>

            {activeDefinition !== null && (
              <>
                <Definition
                  open
                  onClick={() => {}}
                  title={activeDefinition?.title}
                  description={activeDefinition?.description}
                />
              </>
            )}

            {definitions.length > 0 && (
              <>
                <h3>
                  {activeDefinition ? `${t('modal.related')} ` : ''}
                  {t('modal.definitions')}
                </h3>
                {activeDefinitions.map((item, index: number) => (
                  <Definition
                    key={`def_${index}`}
                    onClick={() => {}}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </>
            )}

            {activeExternals.length > 0 && (
              <>
                <h3>{t('modal.articles')}</h3>
                {activeExternals.map((item, index: number) => (
                  <External
                    key={`ext_${index}`}
                    width="100%"
                    title={t(item.title)}
                    url={item.url}
                    website={item.website}
                  />
                ))}
              </>
            )}
          </ContentWrapper>
        </HeightWrapper>
        <button
          type="button"
          className="close"
          onClick={() => {
            closeHelp();
          }}
        >
          &nbsp;
        </button>
      </div>
    </Wrapper>
  );
};
