import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { vendor } from "./vendor";
import { purchasedItem, purchase } from "./purchase";
import { purchaseArchive } from "./archive";
import { item } from "./item";
import { category } from "./category";

/**
 
   role      tx     plan   user   category  
 --------- ------- ------ ------ ---------- 
  admin     all     all    all    all       
  manager   all     all    x      c/u/e     
  staff     v/c/u   all    x                
  guest     v       v      x      x         

  [v]iew, [c]reate, [u]pdate, [e]dit, [d]elete

 */

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "staff",
  "guest",
]);

export type NewUserDbPayload = typeof user.$inferInsert;

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().unique().notNull(),
    username: text("username").unique().notNull(),
    hashedPassword: text("hashed_password").notNull(),
    role: userRoleEnum("role").notNull().default("admin"),
    parentId: text("parent_id")
      .references((): AnyPgColumn => user.id, {
        onDelete: "cascade",
      })
      .notNull(),
    email: text("email"),
    defaultCategory: text("default_category").references(
      (): AnyPgColumn => category.id,
      { onDelete: "cascade" }
    ),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("user_id_idx").on(table.id),
    index("username_idx").on(table.username),
    index("user_email_idx").on(table.email),
  ]
);

export const userRelations = relations(user, ({ many, one }) => ({
  purchasesOwner: many(purchase, { relationName: "owner" }),
  purchasesCreator: many(purchase, { relationName: "creator" }),
  itemsOwner: many(item, { relationName: "owner" }),
  itemsCreator: many(item, { relationName: "creator" }),
  vendorsOwner: many(vendor, { relationName: "owner" }),
  vendorsCreator: many(vendor, { relationName: "creator" }),
  purchaseItemOwner: many(purchasedItem, { relationName: "owner" }),
  purchaseItemCreator: many(purchasedItem, { relationName: "creator" }),
  userActionsHistory: many(userActionHistory),
  purchasesArchiveOwner: many(purchaseArchive, { relationName: "owner" }),
  purchasesArchiveCreator: many(purchaseArchive, { relationName: "creator" }),
  userDefaultCategory: one(category, {
    fields: [user.defaultCategory],
    references: [category.id],
    relationName: "user_default_category",
  }),
}));

export const userActionHistory = pgTable("user_action_history", {
  id: text("id").primaryKey().unique().notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  data: text("json_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userActionHistoryRelations = relations(
  userActionHistory,
  ({ one }) => ({
    userAction: one(user, {
      fields: [userActionHistory.userId],
      references: [user.id],
    }),
  })
);
