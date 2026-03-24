import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __psiloPrisma__: PrismaClient | undefined;
}

export function createPrismaClient() {
  return new PrismaClient();
}

export const prisma =
  globalThis.__psiloPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__psiloPrisma__ = prisma;
}

export type { PrismaClient } from "@prisma/client";
