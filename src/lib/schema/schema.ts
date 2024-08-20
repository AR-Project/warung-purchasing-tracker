import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: text("id").primaryKey().unique().notNull(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("last_modified_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey().unique().notNull(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("last_modified_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: text("id").primaryKey().unique().notNull(),
  vendorId: text("vendor_id")
    .references(() => vendors.id)
    .notNull(),
  purchasedAt: timestamp("purchased_at").notNull(),
  purchasedItemId: text("purchased_item_id")
    .array()
    .default(sql`ARRAY[]::text[]`),
  // TODO: add Not null
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("last_modified_at").defaultNow(),
  totalPrice: integer("total_price").notNull(),
});

export const purchasedItems = pgTable("purchased_items", {
  id: text("id").primaryKey().unique().notNull(),
  purchaseId: text("purchase_id")
    .references(() => purchases.id)
    .notNull(),
  itemId: text("item_id")
    .references(() => items.id)
    .notNull(),
  quantityInHundreds: integer("quantity_in_hundreds").notNull(),
  pricePerUnit: integer("price_per_unit").notNull(),
  totalPrice: integer("total_price").notNull(),
  isDeleted: boolean("is_deleted").default(false),
});
