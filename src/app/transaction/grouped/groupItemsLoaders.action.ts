import { sum, sql, eq, between, asc, and, ilike } from "drizzle-orm";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases } from "@/lib/schema/schema";

export async function groupedPurchasedItemsLoader({
  range,
  keyword,
}: SearchFilter): Promise<DisplayGroupedItem[]> {
  if (range && keyword) {
    return await fetchWithNameAndDate({
      range,
      keyword,
    });
  } else if (range) {
    return await fetchWithDate(range);
  } else if (keyword) {
    return await fetchWithName(keyword);
  } else {
    return defaultFetch();
  }
}

async function fetchWithName(keyword: string): Promise<DisplayGroupedItem[]> {
  const nameFilter = ilike(items.name, keyword);

  return await db
    .select({
      name: items.name,
      id: purchasedItems.itemId,
      totalQuantityInHundred: sum(purchasedItems.quantityInHundreds).mapWith(
        Number
      ),
      totalPrice: sum(purchasedItems.totalPrice).mapWith(Number),
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(nameFilter)
    .groupBy(purchasedItems.itemId, items.name)
    .orderBy(asc(items.name));
}

async function fetchWithNameAndDate({
  range,
  keyword,
}: Required<SearchFilter>): Promise<DisplayGroupedItem[]> {
  const dateFrom = DateTime.fromISO(range.from).startOf("day").toJSDate();
  const dateTo = DateTime.fromISO(range.to).endOf("day").toJSDate();

  const dateFilter = between(purchases.purchasedAt, dateFrom, dateTo);
  const nameFilter = ilike(items.name, keyword);

  const dateAndNameFilter = and(dateFilter, nameFilter);

  return await db
    .select({
      name: items.name,
      id: purchasedItems.itemId,
      totalQuantityInHundred: sum(purchasedItems.quantityInHundreds).mapWith(
        Number
      ),
      totalPrice: sum(purchasedItems.totalPrice).mapWith(Number),
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(dateAndNameFilter)
    .groupBy(purchasedItems.itemId, items.name)
    .orderBy(asc(items.name));
}

async function defaultFetch(): Promise<DisplayGroupedItem[]> {
  return await db
    .select({
      name: items.name,
      id: purchasedItems.itemId,
      totalQuantityInHundred: sum(purchasedItems.quantityInHundreds).mapWith(
        Number
      ),
      totalPrice: sum(purchasedItems.totalPrice).mapWith(Number),
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .groupBy(purchasedItems.itemId, items.name)
    .orderBy(asc(items.name));
}

async function fetchWithDate({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<DisplayGroupedItem[]> {
  const dateFrom = DateTime.fromISO(from).startOf("day").toJSDate();
  const dateTo = DateTime.fromISO(to).endOf("day").toJSDate();

  const dateFilter = between(purchases.purchasedAt, dateFrom, dateTo);

  return await db
    .select({
      name: items.name,
      id: purchasedItems.itemId,
      totalQuantityInHundred: sum(purchasedItems.quantityInHundreds).mapWith(
        Number
      ),
      totalPrice: sum(purchasedItems.totalPrice).mapWith(Number),
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(dateFilter)
    .groupBy(purchasedItems.itemId, items.name)
    .orderBy(asc(items.name));
}
