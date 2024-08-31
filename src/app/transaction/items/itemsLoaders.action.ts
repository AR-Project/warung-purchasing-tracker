"use server";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases, vendors } from "@/lib/schema/schema";
import { eq, sum, between, sql, desc, avg, asc, and, ilike } from "drizzle-orm";
import { DateTime } from "luxon";

export async function purchasedItemsLoader({
  range,
  keyword,
}: SearchFilter): Promise<DisplayPerSingleItem[]> {
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
    return defaultFetchPurchasedItems();
  }
}

async function defaultFetchPurchasedItems(): Promise<DisplayPerSingleItem[]> {
  return await db
    .select({
      name: items.name,
      purchaseAt: purchases.purchasedAt,
      quantityInHundreds: purchasedItems.quantityInHundreds,
      pricePerUnit: purchasedItems.pricePerUnit,
      totalPrice: purchasedItems.totalPrice,
      vendor: vendors.name,
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
    .orderBy(desc(purchases.purchasedAt));
}

async function fetchWithNameAndDate({
  range,
  keyword,
}: Required<SearchFilter>): Promise<DisplayPerSingleItem[]> {
  const dateFrom = DateTime.fromISO(range.from).startOf("day").toJSDate();
  const dateTo = DateTime.fromISO(range.to).endOf("day").toJSDate();

  const dateFilter = between(purchases.purchasedAt, dateFrom, dateTo);
  const nameFilter = ilike(items.name, keyword);

  return await db
    .select({
      name: items.name,
      purchaseAt: purchases.purchasedAt,
      quantityInHundreds: purchasedItems.quantityInHundreds,
      pricePerUnit: purchasedItems.pricePerUnit,
      totalPrice: purchasedItems.totalPrice,
      vendor: vendors.name,
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(and(dateFilter, nameFilter))
    .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
    .orderBy(desc(items.name));
}

async function fetchWithName(name: string): Promise<DisplayPerSingleItem[]> {
  return await db
    .select({
      name: items.name,
      purchaseAt: purchases.purchasedAt,
      quantityInHundreds: purchasedItems.quantityInHundreds,
      pricePerUnit: purchasedItems.pricePerUnit,
      totalPrice: purchasedItems.totalPrice,
      vendor: vendors.name,
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(ilike(items.name, name))
    .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
    .orderBy(desc(items.name));
}
async function fetchWithDate({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<DisplayPerSingleItem[]> {
  const dateFrom = DateTime.fromISO(from).startOf("day").toJSDate();
  const dateTo = DateTime.fromISO(to).endOf("day").toJSDate();

  return await db
    .select({
      name: items.name,
      purchaseAt: purchases.purchasedAt,
      quantityInHundreds: purchasedItems.quantityInHundreds,
      pricePerUnit: purchasedItems.pricePerUnit,
      totalPrice: purchasedItems.totalPrice,
      vendor: vendors.name,
    })
    .from(purchasedItems)
    .innerJoin(items, eq(items.id, purchasedItems.itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .where(between(purchases.purchasedAt, dateFrom, dateTo))
    .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
    .orderBy(desc(items.name));
}
