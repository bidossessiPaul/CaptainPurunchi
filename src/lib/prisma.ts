import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
  __adapter?: PrismaMariaDb;
};

function getAdapter() {
  if (!globalForPrisma.__adapter) {
    globalForPrisma.__adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 20,
      acquireTimeout: 60000,
      idleTimeout: 60000,
    });
  }
  return globalForPrisma.__adapter;
}

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    adapter: getAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
