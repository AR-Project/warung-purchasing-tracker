import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import db from "./db";

console.log("Start database migration...");
(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration Finished");
  process.exit(0);
})();
