import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as archiveSchema from "@/lib/schema/archive";
import * as itemSchema from "@/lib/schema/item";
import * as planSchema from "@/lib/schema/plan";
import * as imageSchema from "@/lib/schema/image";
import * as userSchema from "@/lib/schema/user";
import * as categorySchema from "@/lib/schema/category";
import * as purchaseSchema from "@/lib/schema/purchase";
import * as vendorSchema from "@/lib/schema/vendor";

const isTest = () => process.env.NODE_ENV === "test";

const pool = new Pool({
  connectionString: isTest()
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL,
});

const db = drizzle(pool, {
  schema: {
    ...itemSchema,
    ...imageSchema,
    ...userSchema,
    ...archiveSchema,
    ...planSchema,
    ...categorySchema,
    ...purchaseSchema,
    ...vendorSchema,
  },
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export default db;
