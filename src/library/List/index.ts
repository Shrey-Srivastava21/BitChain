// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';
import type { ListProps, PaginationWrapperProps } from './types';

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column nowrap;
`;

export const Header = styled.div`
  border-bottom: 1px solid var(--border-primary-color);
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  padding: 0 0.25rem 0.5rem 0.25rem;
  flex: 1;

  h4 {
    color: var(--text-color-secondary);
    font-family: InterSemiBold, sans-serif;
  }

  > div {
    display: flex;
    align-items: center;
  }

  > div:last-child {
    justify-content: flex-end;
    flex: 1;

    button {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
      margin: 0 0.5rem 0 0.75rem;
      opacity: 0.6;
      transition: all var(--transition-duration);

      &:hover {
        opacity: 0.9;
      }
    }
  }
`;

export const PaginationWrapper = styled.div<PaginationWrapperProps>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;

  > div:first-child {
    display: flex;
    flex: 1;
  }
  > div:last-child {
    display: flex;
    justify-content: flex-end;

    button {
      font-size: 0.98rem;
      padding: 0 0.25rem;
      margin-left: 0.5rem;
      &.next {
        color: ${(props) =>
          props.$next
            ? 'var(--network-color-primary)'
            : 'var(--text-color-secondary)'};
        cursor: ${(props) => (props.$next ? 'pointer' : 'default')};
        opacity: ${(props) => (props.$next ? 1 : 0.4)};
      }
      &.prev {
        color: ${(props) =>
          props.$prev
            ? 'var(--network-color-primary)'
            : 'var(--text-color-secondary)'};
        cursor: ${(props) => (props.$prev ? 'pointer' : 'default')};
        opacity: ${(props) => (props.$prev ? 1 : 0.4)};
      }
    }
  }
`;

export const SelectableWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  > button {
    border: 1px solid var(--border-primary-color);
    font-size: 1rem;
    color: var(--text-color-secondary);
    border-radius: 1.5rem;
    padding: 0.45rem 1rem;
    margin-right: 0.5rem;
    margin-bottom: 0.75rem;

    > svg {
      margin-right: 0.5rem;
    }

    &:disabled {
      opacity: var(--opacity-disabled);
    }

    &:hover {
      color: var(--text-color-primary);
    }
  }
`;

export const List = styled.div<ListProps>`
  margin-top: 1rem;
  width: 100%;

  > div {
    display: flex;
    flex-wrap: wrap;

    h4 {
      &.none {
        padding: 0.5rem;
      }
    }

    > .item {
      display: flex;
      align-items: center;
      overflow: hidden;

      &.row {
        flex-basis: 100%;
      }

      &.col {
        flex-grow: 1;
        flex-basis: 100%;
        @media (min-width: 875px) {
          flex-basis: 50%;
          max-width: 50%;
        }
        @media (min-width: 1500px) {
          flex-basis: ${(props) => props.$flexBasisLarge};
          max-width: ${(props) => props.$flexBasisLarge};
        }
      }
    }
  }
`;

export const SearchInputWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 0.5rem 0 1.5rem 0;
  width: 100%;

  > input {
    border: 1.75px solid var(--border-primary-color);
    color: var(--text-color-secondary);
    font-family: InterBold, sans-serif;
    border-radius: 1.75rem;
    padding: 0.75rem 1.25rem;
    font-size: 1.15rem;
    width: 100%;

    &:focus {
      border-width: 1.75px;
    }
  }
`;
