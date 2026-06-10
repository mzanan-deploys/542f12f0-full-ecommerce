import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "No database URL found. Run `vercel env pull .env.local --environment=production` first, or set POSTGRES_URL.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
