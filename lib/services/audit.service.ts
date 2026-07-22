import {
  ActivityStatus,
  Prisma,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import { getRequestContext } from "@/lib/security/request-context";

export type AuditLogStatus =
  | "SUCCESS"
  | "FAILED";

export interface CreateAuditLogInput {
  request?: Request;

  userId?: string | null;

  action: string;
  entity: string;

  entityId?: string | null;

  description: string;

  status?: AuditLogStatus;

  metadata?: Prisma.InputJsonValue;
}

function getDatabaseStatus(
  status: AuditLogStatus,
): ActivityStatus {
  return status === "FAILED"
    ? ActivityStatus.FAILED
    : ActivityStatus.SUCCESS;
}

export async function createAuditLog({
  request,

  userId = null,

  action,
  entity,
  entityId = null,

  description,

  status = "SUCCESS",

  metadata,
}: CreateAuditLogInput): Promise<void> {
  const context = request
    ? getRequestContext(request)
    : {
        ipAddress: null,
        userAgent: null,
      };

  await prisma.activityLog.create({
    data: {
      userId,

      action,
      entity,
      entityId,

      description,

      ipAddress:
        context.ipAddress,

      status:
        getDatabaseStatus(status),

      metadata:
        metadata === undefined
          ? undefined
          : metadata,
    },
  });
}

export async function createAuditLogSafely(
  input: CreateAuditLogInput,
): Promise<void> {
  try {
    await createAuditLog(input);
  } catch (error) {
    console.error(
      "Audit logging error:",
      error,
    );
  }
}