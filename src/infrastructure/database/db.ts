import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as itemSchema from "@/lib/schema/item";
import * as globalSchema from "@/lib/schema/schema";
import * as userSchema from "@/lib/schema/user";
import * as archiveSchema from "@/lib/schema/archive";

const isTest = () => process.env.NODE_ENV === "test";

const pool = new Pool({
  connectionString: isTest()
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL,
});

const db = drizzle(pool, {
  schema: {
    ...itemSchema,
    ...globalSchema,
    ...userSchema,
    ...archiveSchema,
  },
});

export default db;
