// Prisma 7 config file for the Prisma CLI (generate/migrate/db seed/studio).
// This is CLI-only — it has no effect on the running app, which builds its
// own connection via a driver adapter in lib/prisma.ts instead. See
// README-database.md for why the two are configured separately.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (unpooled) connection — PgBouncer's
    // transaction-pooling mode doesn't support what `prisma migrate` does.
    // Falls back to DATABASE_URL if DIRECT_URL isn't set (e.g. local
    // Postgres, where there's no pooler and both are the same value anyway).
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
