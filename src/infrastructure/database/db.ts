import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const isTest = () => process.env.NODE_ENV === "test";

const pool = new Pool({
  connectionString: isTest()
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL,
});

const db = drizzle(pool);

export default db;
