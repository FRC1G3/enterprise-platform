export type UserRole =
  | "USER"
  | "ADMIN";

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
}

export interface VerifiedAuthSession
  extends AuthSession {
  rememberMe: boolean;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  phone: string | null;
  avatar: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: AuthUser;
}