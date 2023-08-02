// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const ContentWrapper = styled.div`
  border-radius: 1rem;
  display: flex;
  flex-flow: column nowrap;
  flex-basis: 50%;
  min-width: 50%;
  height: auto;
  flex-grow: 1;

  .padding {
    padding: 0 1rem 1rem 1rem;

    h2 {
      margin-bottom: 0.5rem;
    }

    input {
      font-family: InterBold, sans-serif;
      margin-top: 0.5rem;
    }
  }

  .items {
    position: relative;
    padding: 0.5rem 0 0rem 0;
    border-bottom: none;
    width: auto;
    border-radius: 0.75rem;
    overflow: hidden;
    overflow-y: auto;
    z-index: 1;
    width: 100%;

    h4 {
      margin: 0.2rem 0;
    }

    .arrow {
      color: var(--text-color-primary);
    }
  }
`;

export const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem 0 0.5rem;

  h5 {
    font-family: InterSemiBold, sans-serif;
    margin: 0;
    margin-left: 0.75rem;

    > span {
      margin-left: 0.75rem;
    }
    &.neutral,
    .neutral {
      color: var(--network-color-primary);
      opacity: 0.8;
    }
    &.danger,
    .danger {
      color: var(--status-danger-color);
    }
    &.success,
    .success {
      color: var(--status-success-color);
    }
  }

  > div:first-child {
    display: flex;
    align-items: center;
    margin: 1.25rem 0 0.5rem 0;

    h2 {
      margin: 0;
      font-family: InterBold, sans-serif;
    }
  }

  .changeRate {
    display: flex;
    flex-wrap: wrap;
    margin: 0.25rem 0;
  }

  > div {
    display: flex;
    align-items: center;

    > .slider {
      flex-grow: 1;

      &.no-value {
        padding-left: 0;
      }

      .rc-slider-handle-dragging {
        box-shadow: 0 0 0 5px var(--network-color-transparent) !important;
      }
    }
  }

  .stats {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 1rem;
    h2 {
      border-bottom: 1px solid var(--border-primary-color);
      font-family: InterBold, sans-serif;
      margin-top: 0rem;
      padding-bottom: 1rem;
    }
  }

  .done {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  .confirm {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-end;
    margin-top: 2.5rem;
  }
`;
