import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./user";
import { image } from "./image";
import { purchasedItem } from "./purchase";
import { category } from "./category";

export type NewItemDbPayload = typeof item.$inferInsert;
export type ItemRowData = typeof item.$inferSelect;

export const item = pgTable(
  "items",
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
    imageId: text("image_id").references(() => image.id, {
      onDelete: "set null",
    }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, {
        onDelete: "set null",
      }),
    sortOrder: integer("sort_order"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("item_name_idx").on(table.name),
    index("item_owner_idx").on(table.ownerId),
    index("item_creator_idx").on(table.creatorId),
  ]
);

export const itemRelations = relations(item, ({ one, many }) => ({
  owner: one(user, {
    fields: [item.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [item.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  image: one(image, {
    fields: [item.imageId],
    references: [image.id],
  }),
  category: one(category, {
    fields: [item.categoryId],
    references: [category.id],
  }),
  purchaseItem: many(purchasedItem),
}));
