import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { purchase } from "./purchase";
import { user } from "./user";

export const vendor = pgTable(
  "vendors",
  {
    id: text("id").primaryKey().unique().notNull(),
    ownerId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("vendor_name_idx").on(table.name),
    index("vendor_owner_idx").on(table.ownerId),
    index("vendor_creator_idx").on(table.creatorId),
  ]
);

export type NewVendorDbPayload = typeof vendor.$inferInsert;

export const vendorRelations = relations(vendor, ({ one, many }) => ({
  owner: one(user, {
    fields: [vendor.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [vendor.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  purchase: many(purchase),
}));
