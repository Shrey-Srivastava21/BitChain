// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SmallFontSizeMaxWidth } from 'consts';
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled.div<{ $format?: string; $inModal?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  height: ${(props) => (props.$format === 'nomination' ? '6rem' : '3rem')};
  position: relative;
  margin: 0.5rem;

  > .inner {
    background: ${(props) =>
      props.$inModal
        ? 'var(--background-modal-item)'
        : 'var(--background-list-item)'};

    ${(props) =>
      props.$inModal &&
      `
      box-shadow: none;
      border: none;`}
    flex: 1;
    border-radius: 1rem;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    flex: 1;
    overflow: hidden;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    padding: 0;
    .row {
      flex: 1 0 100%;
      height: 3.25rem;
      display: flex;
      align-items: center;
      padding: 0 0.5rem;

      &.status {
        height: 2.75rem;
      }
      svg {
        margin: 0;
      }
    }
  }
`;

export const Labels = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 0.85rem;
  align-items: center;
  overflow: hidden;
  flex: 1 1 100%;
  padding: 0 0 0 0.25rem;
  height: 2.75rem;

  button {
    padding: 0 0.1rem;
    @media (min-width: ${SmallFontSizeMaxWidth}px) {
      padding: 0 0.2rem;
    }
    color: var(--text-color-secondary);
    &:hover {
      opacity: 0.75;
    }
    &.active {
      color: var(--network-color-primary);
    }
    &:disabled {
      opacity: var(--opacity-disabled);
    }
  }

  .label {
    color: var(--text-color-secondary);
    position: relative;
    display: flex;
    align-items: center;
    margin: 0 0.2rem;
    font-size: inherit;

    @media (min-width: ${SmallFontSizeMaxWidth}px) {
      margin: 0 0.2rem;
      &.pool {
        margin: 0 0.4rem;
      }
    }
    button {
      font-size: 1.1rem;
    }
    &.button-with-text {
      margin-right: 0;

      button {
        color: var(--network-color-primary);
        font-size: 0.95rem;
        display: flex;
        flex-flow: row wrap;
        align-items: center;

        > svg {
          margin-left: 0.3rem;
        }
      }
    }

    &.warning {
      color: #d2545d;
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      padding-right: 0.35rem;
    }
  }
`;

export const OverSubscribedWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;

  .warning {
    margin-right: 0.25rem;
    @media (max-width: 500px) {
      display: none;
    }
  }
`;
export const IdentityWrapper = styled(motion.div)`
  display: flex;
  margin-right: 0.5rem;
  align-items: center;
  align-content: center;
  overflow: hidden;
  flex: 1 1 25%;
  position: relative;

  .inner {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    width: 100%;
    height: 3.25rem;
    padding: 0 0 0 0.2rem;
  }
  h4 {
    color: var(--text-color-secondary);
    font-family: InterSemiBold, sans-serif;
    position: absolute;
    top: 0;
    width: 100%;
    height: 3.25rem;
    line-height: 3.25rem;
    padding: 0 0 0 0.3rem;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1rem;

    > span {
      color: var(--text-color-secondary);
      opacity: 0.75;
      font-size: 0.88rem;
      margin-left: 0.35rem;
      position: relative;
      top: -0.1rem;
    }
  }
`;

export const ValidatorStatusWrapper = styled.div<{ $status: string }>`
  margin-right: 0.35rem;
  padding: 0 0.5rem;

  h5 {
    color: ${(props) =>
      props.$status === 'active'
        ? 'var(--status-success-color)'
        : 'var(--text-color-secondary)'};
    opacity: ${(props) => (props.$status === 'active' ? 0.8 : 0.5)};
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const SelectWrapper = styled.button`
  background: var(--background-input);
  margin: 0 0.75rem 0 0.25rem;
  overflow: hidden;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  border-radius: 0.25rem;
  width: 1.1rem;
  height: 1.1rem;
  padding: 0;
  * {
    cursor: pointer;
    width: 100%;
    padding: 0;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    color: var(--text-color-primary);
    width: 1rem;
    height: 1rem;
  }
  .select-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
`;

export const Separator = styled.div`
  border-bottom: 1px solid var(--border-primary-color);
  width: 100%;
  height: 1px;
  opacity: 0.7;
`;

export const MenuPosition = styled.div`
  position: absolute;
  top: -10px;
  right: 10px;
  width: 0;
  height: 0;
  opacity: 0;
`;

export const TooltipTrigger = styled.div`
  z-index: 1;
  width: 130%;
  height: 130%;
  position: absolute;
  top: -10%;
  left: -10%;

  &.as-button {
    cursor: pointer;
  }
`;
