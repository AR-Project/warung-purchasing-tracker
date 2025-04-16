import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./user";
import { images, purchasedItems } from "./schema";

export type NewItemDbPayload = typeof items.$inferInsert;
export type ItemRowData = typeof items.$inferSelect;

export const items = pgTable(
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
    imageId: text("image_id").references(() => images.id, {
      onDelete: "set null",
    }),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      itemNameIdx: index("item_name_idx").on(table.name),
      itemOwnerIdx: index("item_owner_idx").on(table.ownerId),
      itemCreatorIdx: index("item_creator_idx").on(table.creatorId),
    };
  }
);

export const itemRelations = relations(items, ({ one, many }) => ({
  owner: one(user, {
    fields: [items.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [items.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  image: one(images, {
    fields: [items.imageId],
    references: [images.id],
  }),
  category: one(category, {
    fields: [items.categoryId],
    references: [category.id],
  }),
  purchaseItem: many(purchasedItems),
}));

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
  (table) => {
    return {
      categoryNameIdx: index("category_name_idx").on(table.name),
      categoryOwnerIdx: index("category_owner_idx").on(table.ownerId),
      categoryCreatorIdx: index("category_creator_idx").on(table.creatorId),
    };
  }
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
  items: many(items),
}));
