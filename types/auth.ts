export type UserRole = "USER" | "ADMIN";

export interface AuthSession {
  userId: string;
  role: UserRole;
}

