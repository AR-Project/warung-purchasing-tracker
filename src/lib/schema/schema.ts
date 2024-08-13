import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const items = pgTable("items", {
  id: text("id").primaryKey().unique(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("last_modified_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey().unique(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("last_modified_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: text("id").primaryKey().unique(),
  vendorId: text("vendor_id")
    .references(() => vendors.id)
    .notNull(),
  date: timestamp("created_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchasedItems = pgTable("purchased_items", {
  id: text("id").primaryKey().unique(),
  purchaseId: text("purchase_id").references(() => purchases.id),
  itemId: text("item_id").references(() => items.id),
  quantityInHundreds: integer("quantity_in_hundreds"),
  pricePerUnit: integer("price_per_unit"),
  totalPrice: integer("total_price"),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("last_modified_at").defaultNow(),
});
