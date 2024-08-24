"use server";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases, vendors } from "@/lib/schema/schema";
import { eq, sum, between, sql, desc, avg, asc } from "drizzle-orm";
import { DateTime } from "luxon";

export async function purchasedItemsLoader() {
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
export async function purchasedItemsByDateLoader({
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
