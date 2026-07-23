import {
  Prisma,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

const MAX_SERIALIZABLE_ATTEMPTS = 3;

function isSerializableConflict(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

export async function runSerializableTransaction<T>(
  operation: (
    transaction: Prisma.TransactionClient,
  ) => Promise<T>,
): Promise<T> {
  for (
    let attempt = 1;
    attempt <=
    MAX_SERIALIZABLE_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await prisma.$transaction(
        operation,
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel
              .Serializable,
        },
      );
    } catch (error) {
      if (
        !isSerializableConflict(error) ||
        attempt ===
          MAX_SERIALIZABLE_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Serializable transaction attempts were exhausted.",
  );
}
