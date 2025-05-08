import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { item } from "./item";
import { user } from "./user";

export type CreateCategoryDbPayload = typeof category.$inferInsert;

export const category = pgTable(
  "category",
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
    sortOrder: integer("sort_order"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("category_name_idx").on(table.name),
    index("category_owner_idx").on(table.ownerId),
    index("category_creator_idx").on(table.creatorId),
  ]
);

export const categoryRelations = relations(category, ({ one, many }) => ({
  owner: one(user, {
    fields: [category.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [category.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  items: many(item),
  usersDefault: many(user),
}));
