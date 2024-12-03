import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as archiveSchema from "@/lib/schema/archive";
import * as itemSchema from "@/lib/schema/item";
import * as planSchema from "@/lib/schema/plan";
import * as globalSchema from "@/lib/schema/schema";
import * as userSchema from "@/lib/schema/user";

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
    ...planSchema,
  },
});

export default db;
