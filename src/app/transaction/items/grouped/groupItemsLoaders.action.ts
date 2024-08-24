import { sum, sql, eq, between, asc } from "drizzle-orm";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases } from "@/lib/schema/schema";

export async function groupedPurchasedItemsLoader() {
  return await db
    .select({
      name: items.name,
      id: purchasedItems.itemId,
      totalQuantityInHundred: sum(purchasedItems.quantityInHundreds),
      averagePricePerUnit: sql<number>`cast(avg(${purchasedItems.pricePerUnit}) as int)`,
      totalPrice: sum(purchasedItems.totalPrice),
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .groupBy(purchasedItems.itemId, items.name)
    .orderBy(asc(items.name));
}

export async function groupedPurchasedItemsByDateLoader({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const dateFrom = DateTime.fromISO(from).startOf("day").toJSDate();
  const dateTo = DateTime.fromISO(to).endOf("day").toJSDate();

  return await db
    .select({
      name: items.name,
      id: purchasedItems.itemId,
      totalQuantityInHundred: sum(purchasedItems.quantityInHundreds),
      averagePricePerUnit: sql<number>`cast(avg(${purchasedItems.pricePerUnit}) as int)`,
      totalPrice: sum(purchasedItems.totalPrice),
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(between(purchases.purchasedAt, dateFrom, dateTo))
    .groupBy(purchasedItems.itemId, items.name)
    .orderBy(asc(items.name));
}
