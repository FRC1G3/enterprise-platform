import type {
  AuthSession,
  UserRole,
} from "@/types/auth";

export function hasRole(
  session: AuthSession | null,
  allowedRoles: UserRole[],
): boolean {
  return session !== null && allowedRoles.includes(session.role);
}

export function isAdmin(
  session: AuthSession | null,
): boolean {
  return hasRole(session, ["ADMIN"]);
}

export function isAuthenticated(
  session: AuthSession | null,
): session is AuthSession {
  return session !== null;
}