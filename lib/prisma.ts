import path from "node:path";

import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith("file:./")) {
  const relativePath = databaseUrl.slice("file:./".length);
  process.env.DATABASE_URL = `file:${path.join(
    /* turbopackIgnore: true */ process.cwd(),
    relativePath,
  )}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
