export type UserRole = "USER" | "ADMIN";

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: AuthUser;
}