export type OrganisationStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'unknown';

export interface Organisation {
  id: number;
  name: string;
  status: OrganisationStatus;
  memberCount: number | null;
  ownerEmail: string | null;
  createdAt: Date | null;
}