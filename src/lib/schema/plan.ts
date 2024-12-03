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
import { generateId } from "../utils/generator";
import { DateTime } from "luxon";

export type NewPlanDbPayload = typeof plan.$inferInsert;

export const plan = pgTable(
  "plan",
  {
    id: text("id")
      .primaryKey()
      .unique()
      .notNull()
      .$default(() => `plan_${generateId(10)}`),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    plannedItemIds: text("plan_item_ids")
      .array()
      .default(sql`ARRAY[]::text[]`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => DateTime.now().toJSDate()),
    totalPrice: integer("total_price").notNull(),
  },
  (table) => {
    return {
      planCreatorIdIdx: index("plan_creator_id_idx").on(table.creatorId),
    };
  }
);

export const planRelation = relations(plan, ({ one, many }) => ({
  creator: one(user, {
    fields: [plan.creatorId],
    references: [user.id],
    relationName: "creator",
  }),
  planItems: many(planItem),
}));

export type NewPlanItemDbPayload = typeof planItem.$inferInsert;

export const planItem = pgTable(
  "plan_item",
  {
    id: text("id")
      .primaryKey()
      .unique()
      .notNull()
      .$default(() => `p_i_${generateId(12)}`),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    planId: text("plan_id")
      .references(() => plan.id, { onDelete: "cascade" })
      .notNull(),
    itemId: text("item_id")
      .references(() => items.id)
      .notNull(),
    quantityInHundreds: integer("quantity_in_hundreds").notNull(),
    pricePerUnit: integer("price_per_unit").notNull(),
    totalPrice: integer("total_price").notNull(),
    sortOrder: integer("sort_order").notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    modifiedAt: timestamp("last_modified_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      planItemItemIdIdx: index("plan_item_item_id_idx").on(table.itemId),
      planItemPlanIdIdx: index("plan_item_plan_id").on(table.planId),
      planItemCreatorIdIdx: index("plan_item_creator_id_idx").on(
        table.creatorId
      ),
    };
  }
);

export const planItemRelations = relations(planItem, ({ one }) => ({
  creator: one(user, {
    fields: [planItem.creatorId],
    references: [user.id],
  }),
  plan: one(plan, {
    fields: [planItem.planId],
    references: [plan.id],
  }),
  item: one(items, {
    fields: [planItem.itemId],
    references: [items.id],
  }),
}));
