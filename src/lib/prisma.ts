import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = createPrismaClient();
}

export const prisma = globalForPrisma.__prisma;
