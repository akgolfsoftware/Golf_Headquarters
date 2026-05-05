// Prisma-klient singleton med Postgres driver adapter (Prisma 7-krav).
// Hindrer at HMR i dev oppretter flere PrismaClient-instances.
//
// DATABASE_URL = pooler (port 6543, ?pgbouncer=true) — for runtime queries.
// DIRECT_URL = direkte (port 5432) — kun for `prisma migrate`, brukes ikke her.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
