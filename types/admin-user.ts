import type {
  UserRole,
} from "@/types/auth";

export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface AdminUser {
  id: string;

  name: string;
  email: string;
  role: UserRole;

  phone: string | null;
  country: string | null;
  city: string | null;

  isActive: boolean;

  orderCount: number;
  totalSpent: number;

  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserListResult {
  users: AdminUser[];
  pagination: AdminUserPagination;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: AdminUserStatus;
}