import type { UserRole } from "./auth";

export interface User { id: string; email: string; name: string; role: UserRole; }
export interface ActivityLog { id: string; userId: string; action: string; createdAt: Date; }

