"use server";

import { eq, between, desc, ilike, and, SQL } from "drizzle-orm";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { purchases, vendors, purchasedItems, items } from "@/lib/schema/schema";

export async function transactionLoader(
  { range, keyword }: SearchFilter,
  userId: string
): Promise<PurchaseDisplay[]> {
  const dateFrom = range
    ? DateTime.fromISO(range.from).startOf("day").toJSDate()
    : DateTime.now().toJSDate();
  const dateTo = range
    ? DateTime.fromISO(range.to).endOf("day").toJSDate()
    : DateTime.now().toJSDate();
  const keywordFilter = keyword ? keyword : "";

  const userFilter = eq(purchases.ownerId, userId);

  const dateFilter = between(purchases.purchasedAt, dateFrom, dateTo);
  const dateAndUserFilter = and(userFilter, dateFilter) as SQL;

  const nameFilter = ilike(vendors.name, keywordFilter);
  const nameAndUserFilter = and(userFilter, nameFilter) as SQL;

  const searchFilter = and(dateFilter, nameFilter, userFilter) as SQL;

  if (range && keyword) {
    return await filteredFetch(searchFilter);
  } else if (range) {
    return await filteredFetch(dateAndUserFilter);
  } else if (keyword) {
    return await filteredFetch(nameAndUserFilter);
  } else {
    return await defaultFetch(userId);
  }
}

async function filteredFetch(filter: SQL): Promise<PurchaseDisplay[]> {
  return await db.transaction(async (tx) => {
    const purchaseTransactions = await tx
      .select({
        id: purchases.id,
        vendorId: purchases.vendorId,
        vendorName: vendors.name,
        purchasedItemId: purchases.purchasedItemId,
        purchasesAt: purchases.purchasedAt,
        totalPrice: purchases.totalPrice,
        createdAt: purchases.createdAt,
        imageId: purchases.imageId,
      })
      .from(purchases)
      .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
      .where(filter)
      .orderBy(desc(purchases.purchasedAt));

    const allPurchasedItems = await tx
      .select({
        id: purchasedItems.id,
        itemId: purchasedItems.itemId,
        name: items.name,
        quantityInHundreds: purchasedItems.quantityInHundreds,
        pricePerUnit: purchasedItems.pricePerUnit,
      })
      .from(purchasedItems)
      .innerJoin(items, eq(purchasedItems.itemId, items.id));

    const purchasedTransactionsWithItem = purchaseTransactions.map(
      (purchase) => ({
        ...purchase,
        items: allPurchasedItems.filter((item) =>
          purchase.purchasedItemId?.includes(item.id)
        ),
      })
    );
    return purchasedTransactionsWithItem;
  });
}

async function defaultFetch(ownerId: string): Promise<PurchaseDisplay[]> {
  return await db.transaction(async (tx) => {
    const purchase = await tx
      .select({
        id: purchases.id,
        vendorId: purchases.vendorId,
        vendorName: vendors.name,
        purchasedItemId: purchases.purchasedItemId,
        purchasesAt: purchases.purchasedAt,
        totalPrice: purchases.totalPrice,
        createdAt: purchases.createdAt,
        imageId: purchases.imageId,
      })
      .from(purchases)
      .where(eq(purchases.ownerId, ownerId))
      .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
      .orderBy(desc(purchases.purchasedAt));

    const listOfPurchaseItem = await tx
      .select({
        id: purchasedItems.id,
        itemId: purchasedItems.itemId,
        name: items.name,
        quantityInHundreds: purchasedItems.quantityInHundreds,
        pricePerUnit: purchasedItems.pricePerUnit,
      })
      .from(purchasedItems)
      .where(eq(purchasedItems.ownerId, ownerId))
      .innerJoin(items, eq(purchasedItems.itemId, items.id));

    const purchaseWithListOfPurchaseItem = purchase.map((purchase) => ({
      ...purchase,
      items: listOfPurchaseItem.filter((item) =>
        purchase.purchasedItemId?.includes(item.id)
      ),
    }));
    return purchaseWithListOfPurchaseItem;
  });
}
