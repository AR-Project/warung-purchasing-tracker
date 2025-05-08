import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { item } from "./item";
import { image } from "./image";
import { vendor } from "./vendor";
import { user } from "./user";

export type NewPurchaseDbPayload = typeof purchase.$inferInsert;

export const purchase = pgTable(
  "purchases",
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
    vendorId: text("vendor_id")
      .references(() => vendor.id)
      .notNull(),
    imageId: text("image_id").references(() => image.id, {
      onDelete: "set null",
    }),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull(),
    purchasedItemId: text("purchased_item_id")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    totalPrice: integer("total_price").notNull(),
  },
  (table) => [
    index("purchase_vendor_id_idx").on(table.vendorId),
    index("purchase_owner_id_idx").on(table.ownerId),
    index("purchase_creator_id_idx").on(table.creatorId),
  ]
);

export const purchaseRelations = relations(purchase, ({ one, many }) => ({
  owner: one(user, {
    fields: [purchase.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [purchase.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  image: one(image, {
    fields: [purchase.imageId],
    references: [image.id],
  }),
  vendor: one(vendor, {
    fields: [purchase.vendorId],
    references: [vendor.id],
  }),
  purchaseItems: many(purchasedItem),
}));

export type NewPurchaseItemDbPayload = typeof purchasedItem.$inferInsert;

export const purchasedItem = pgTable(
  "purchased_items",
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
    purchaseId: text("purchase_id")
      .references(() => purchase.id, { onDelete: "cascade" })
      .notNull(),
    itemId: text("item_id")
      .references(() => item.id)
      .notNull(),
    quantityInHundreds: integer("quantity_in_hundreds").notNull(),
    pricePerUnit: integer("price_per_unit").notNull(),
    totalPrice: integer("total_price").notNull(),
    sortOrder: integer("sort_order").notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("purchased_item_id_idx").on(table.itemId),
    index("purchase_item_purchase_id_idx").on(table.purchaseId),
    index("purchase_item_owner_id_idx").on(table.ownerId),
    index("purchase_item_creator_id_idx").on(table.creatorId),
  ]
);

export const purchaseItemRelations = relations(purchasedItem, ({ one }) => ({
  owner: one(user, {
    fields: [purchasedItem.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [purchasedItem.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  purchase: one(purchase, {
    fields: [purchasedItem.purchaseId],
    references: [purchase.id],
  }),
  item: one(item, {
    fields: [purchasedItem.itemId],
    references: [item.id],
  }),
}));
