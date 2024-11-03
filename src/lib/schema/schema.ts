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
import { items } from "./item";

export type NewImageDbPayload = typeof images.$inferInsert;

export const images = pgTable(
  "images",
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
    path: text("path").notNull(),
    fileExtension: text("file_extension").notNull().default(".jpg"),
    originalFileName: text("original_filename").notNull(),
    uploadedAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      imageOwnerIdx: index("image_owner_idx").on(table.ownerId),
      imageCreatorIdx: index("image_creator_idx").on(table.creatorId),
    };
  }
);

export const imageRelations = relations(images, ({ one }) => ({
  owner: one(user, {
    fields: [images.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [images.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
}));

export const vendors = pgTable(
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
  (table) => {
    return {
      vendorNameIdx: index("vendor_name_idx").on(table.name),
      vendorOwnerIdx: index("vendor_owner_idx").on(table.ownerId),
      vendorCreatorIdx: index("vendor_creator_idx").on(table.creatorId),
    };
  }
);

export type NewVendorDbPayload = typeof vendors.$inferInsert;

export const vendorRelations = relations(vendors, ({ one, many }) => ({
  owner: one(user, {
    fields: [vendors.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [vendors.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  purchase: many(purchases),
}));

export type NewPurchaseDbPayload = typeof purchases.$inferInsert;

export const purchases = pgTable(
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
  },
  (table) => {
    return {
      purchaseVendorIdIdx: index("purchase_vendor_id_idx").on(table.vendorId),
      purchaseOwnerIdIdx: index("purchase_owner_id_idx").on(table.ownerId),
      purchaseCreatorIdIdx: index("purchase_creator_id_idx").on(
        table.creatorId
      ),
    };
  }
);

export const purchaseRelations = relations(purchases, ({ one, many }) => ({
  owner: one(user, {
    fields: [purchases.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [purchases.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  image: one(images, {
    fields: [purchases.imageId],
    references: [images.id],
  }),
  vendor: one(vendors, {
    fields: [purchases.vendorId],
    references: [vendors.id],
  }),
  purchaseItems: many(purchasedItems),
}));

export type NewPurchaseItemDbPayload = typeof purchasedItems.$inferInsert;

export const purchasedItems = pgTable(
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
      .references(() => purchases.id, { onDelete: "cascade" })
      .notNull(),
    itemId: text("item_id")
      .references(() => items.id)
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
  (table) => {
    return {
      purchaseditemIdIdx: index("purchased_item_id_idx").on(table.itemId),
      purchaseItemPurchaseIdIdx: index("purchase_item_purchase_id_idx").on(
        table.purchaseId
      ),
      purchaseItemOwnerIdIdx: index("purchase_item_owner_id_idx").on(
        table.ownerId
      ),
      purchaseItemCreatorIdIdx: index("purchase_item_creator_id_idx").on(
        table.creatorId
      ),
    };
  }
);

export const purchaseItemRelations = relations(purchasedItems, ({ one }) => ({
  owner: one(user, {
    fields: [purchasedItems.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [purchasedItems.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  purchase: one(purchases, {
    fields: [purchasedItems.purchaseId],
    references: [purchases.id],
  }),
  item: one(items, {
    fields: [purchasedItems.itemId],
    references: [items.id],
  }),
}));
