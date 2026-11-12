import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 requires an explicit driver adapter — bare `new PrismaClient()`
// no longer works. The adapter gets the *runtime* (pooled) connection
// string; prisma.config.ts at the project root gets the *direct* one, used
// only by the CLI for migrations. See README-database.md.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check your .env file.");
}

const adapter = new PrismaPg({ connectionString });

// Prevents exhausting your database connection limit during Next.js hot
// reloads in development by reusing a single PrismaClient instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
