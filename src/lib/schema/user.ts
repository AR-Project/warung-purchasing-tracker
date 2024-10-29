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
import { items, purchasedItems, purchases, vendors } from "./schema";

export const userRoleEnum = pgEnum("user_role", [
  "admin", // view, create, edit, delete tx, create/del user, change role,
  "manager", // view, create, edit, delete tx, create/del user,
  "staff", // view, create tx,
  "guest", // view tx,
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
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => {
    return {
      userIdIdx: index("user_id_idx").on(table.id),
      usernameIdx: index("username_idx").on(table.username),
      userEmailIdx: index("user_email_idx").on(table.email),
    };
  }
);

export const userRelations = relations(user, ({ many }) => ({
  purchasesOwner: many(purchases, { relationName: "owner" }),
  purchasesCreator: many(purchases, { relationName: "creator" }),
  itemsOwner: many(items, { relationName: "owner" }),
  itemsCreator: many(items, { relationName: "creator" }),
  vendorsOwner: many(vendors, { relationName: "owner" }),
  vendorsCreator: many(vendors, { relationName: "creator" }),
  purchaseItemOwner: many(purchasedItems, { relationName: "owner" }),
  purchaseItemCreator: many(purchasedItems, { relationName: "creator" }),
  userActionsHistory: many(userActionHistory),
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
