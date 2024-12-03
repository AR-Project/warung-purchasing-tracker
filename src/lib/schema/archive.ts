import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export type NewPurchaseArchiveDbPayload = typeof purchaseArchive.$inferInsert;

export const purchaseArchive = pgTable("purchase_archive", {
  id: text("id").primaryKey().unique().notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  description: text("description").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const purchaseArchiveRelations = relations(
  purchaseArchive,
  ({ one }) => ({
    owner: one(user, {
      fields: [purchaseArchive.ownerId],
      references: [user.id],
      relationName: "owner",
    }),
    creator: one(user, {
      fields: [purchaseArchive.creatorId],
      references: [user.id],
      relationName: "creator",
    }),
  })
);
