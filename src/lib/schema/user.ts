import {
  AnyPgColumn,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin", // view, create, edit, delete tx, create user, change role
  "manager", // view, create, edit, delete tx, create user,
  "staff", // view, create,
  "guest", // view,
]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().unique().notNull(),
    username: text("username").unique().notNull(),
    hashedPassword: text("hashed_password").notNull(),
    role: userRoleEnum("role").default("admin").notNull(),
    parentId: text("parent_id").references((): AnyPgColumn => user.id, {
      onDelete: "cascade",
    }),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userIdIdx: index("user_id_idx").on(table.id),
      usernameIdx: index("username_idx").on(table.username),
      userEmailIdx: index("user_email_idx").on(table.email),
    };
  }
);

export const userActionHistory = pgTable("user_action_history", {
  id: text("id").primaryKey().unique().notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  data: text("json_data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
