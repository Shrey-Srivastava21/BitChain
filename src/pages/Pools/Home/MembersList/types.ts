// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface MembersListProps {
  allowMoreCols: boolean;
  pagination: boolean;
  batchKey: string;
  title: string;
  disableThrottle?: boolean;
  selectToggleable?: boolean;
}

export type DefaultMembersListProps = MembersListProps & {
  members: any;
};

export type FetchpageMembersListProps = MembersListProps & {
  memberCount: number;
};
