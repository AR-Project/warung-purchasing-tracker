import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";

export const featureFlag = pgTable(
  "feature_flag",
  {
    name: text("name").primaryKey().unique().notNull(),
    isEnabled: boolean().notNull().default(true),
  },

  (table) => [index("feature_flag_name_idx").on(table.name)]
);
