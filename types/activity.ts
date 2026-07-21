export type ActivityLogStatus =
  | "SUCCESS"
  | "FAILED";

export interface ActivityLogUser {
  id: string;
  name: string;
  email: string;
}

export interface ActivityLogItem {
  id: string;

  userId: string | null;
  user: ActivityLogUser | null;

  action: string;
  entity: string;
  entityId: string | null;

  description: string;
  ipAddress: string | null;

  status: ActivityLogStatus;
  metadata: unknown | null;

  createdAt: string;
}

export interface ActivityUserOption {
  id: string;
  name: string;
  email: string;
}

export interface ActivityFilterOptions {
  actions: string[];
  entities: string[];
  users: ActivityUserOption[];
}

export interface ActivityLogPage {
  items: ActivityLogItem[];

  total: number;

  nextCursor: string | null;
  hasMore: boolean;

  filters: ActivityFilterOptions;
}

export interface ActivityLogParams {
  limit?: number;
  cursor?: string;

  search?: string;
  action?: string;
  entity?: string;
  userId?: string;

  status?: ActivityLogStatus;
  date?: string;
}