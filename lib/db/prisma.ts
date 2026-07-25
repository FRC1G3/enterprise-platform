import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnvironment } from "@/lib/env/server";

const environment = getServerEnvironment();

const adapter = new PrismaPg({
  connectionString: environment.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (environment.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
