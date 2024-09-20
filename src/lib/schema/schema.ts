import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const images = pgTable("images", {
  id: text("id").primaryKey().unique().notNull(),
  fileExtension: text("file_extension").notNull().default(".jpg"),
  originalFileName: text("original_filename").notNull(),
  uploadedAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey().unique().notNull(),
    name: text("name").unique().notNull(),
    imageId: text("image_id").references(() => images.id, {
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
      itemsNameIdx: index("item_name_idx").on(table.name),
    };
  }
);

export const vendors = pgTable(
  "vendors",
  {
    id: text("id").primaryKey().unique().notNull(),
    name: text("name").unique().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      vendorNameIdx: index("vendor_name_idx").on(table.name),
    };
  }
);

export const purchases = pgTable("purchases", {
  id: text("id").primaryKey().unique().notNull(),
  vendorId: text("vendor_id")
    .references(() => vendors.id)
    .notNull(),
  imageId: text("image_id").references(() => images.id, {
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
});

export const purchasedItems = pgTable(
  "purchased_items",
  {
    id: text("id").primaryKey().unique().notNull(),
    purchaseId: text("purchase_id")
      .references(() => purchases.id, { onDelete: "cascade" })
      .notNull(),
    itemId: text("item_id")
      .references(() => items.id)
      .notNull(),
    quantityInHundreds: integer("quantity_in_hundreds").notNull(),
    pricePerUnit: integer("price_per_unit").notNull(),
    totalPrice: integer("total_price").notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
  },
  (table) => {
    return {
      purchaseditemIdIdx: index("purchased_item_id_idx").on(table.itemId),
    };
  }
);
