import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
