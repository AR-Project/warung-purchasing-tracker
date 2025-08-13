import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export type NewImageDbPayload = typeof image.$inferInsert;

export const image = pgTable(
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
    url: text("url").notNull(),
    serverFileName: text("server_file_name").notNull(),
    originalFileName: text("original_filename").notNull(),
    uploadedAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("image_owner_idx").on(table.ownerId),
    index("image_creator_idx").on(table.creatorId),
  ]
);

export const imageRelations = relations(image, ({ one }) => ({
  owner: one(user, {
    fields: [image.ownerId],
    references: [user.id],
    relationName: "owner",
  }),
  creator: one(user, {
    fields: [image.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
}));
