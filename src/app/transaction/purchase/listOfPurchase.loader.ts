"use server";

import { eq, between, desc, ilike, and, SQL } from "drizzle-orm";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { vendor } from "@/lib/schema/vendor";
import { purchase, purchasedItem } from "@/lib/schema/purchase";
import { item } from "@/lib/schema/item";

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

  const userFilter = eq(purchase.ownerId, userId);

  const dateFilter = between(purchase.purchasedAt, dateFrom, dateTo);
  const dateAndUserFilter = and(userFilter, dateFilter) as SQL;

  const nameFilter = ilike(vendor.name, keywordFilter);
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
        id: purchase.id,
        vendorId: purchase.vendorId,
        vendorName: vendor.name,
        purchasedItemId: purchase.purchasedItemId,
        purchasesAt: purchase.purchasedAt,
        totalPrice: purchase.totalPrice,
        createdAt: purchase.createdAt,
        imageId: purchase.imageId,
      })
      .from(purchase)
      .innerJoin(vendor, eq(purchase.vendorId, vendor.id))
      .where(filter)
      .orderBy(desc(purchase.purchasedAt));

    const allPurchasedItems = await tx
      .select({
        id: purchasedItem.id,
        itemId: purchasedItem.itemId,
        name: item.name,
        quantityInHundreds: purchasedItem.quantityInHundreds,
        pricePerUnit: purchasedItem.pricePerUnit,
      })
      .from(purchasedItem)
      .innerJoin(item, eq(purchasedItem.itemId, item.id));

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
    const purchaseResult = await tx
      .select({
        id: purchase.id,
        vendorId: purchase.vendorId,
        vendorName: vendor.name,
        purchasedItemId: purchase.purchasedItemId,
        purchasesAt: purchase.purchasedAt,
        totalPrice: purchase.totalPrice,
        createdAt: purchase.createdAt,
        imageId: purchase.imageId,
      })
      .from(purchase)
      .where(eq(purchase.ownerId, ownerId))
      .innerJoin(vendor, eq(purchase.vendorId, vendor.id))
      .orderBy(desc(purchase.purchasedAt));

    const listOfPurchaseItem = await tx
      .select({
        id: purchasedItem.id,
        itemId: purchasedItem.itemId,
        name: item.name,
        quantityInHundreds: purchasedItem.quantityInHundreds,
        pricePerUnit: purchasedItem.pricePerUnit,
      })
      .from(purchasedItem)
      .where(eq(purchasedItem.ownerId, ownerId))
      .innerJoin(item, eq(purchasedItem.itemId, item.id));

    const purchaseWithListOfPurchaseItem = purchaseResult.map((purchase) => ({
      ...purchase,
      items: listOfPurchaseItem.filter((item) =>
        purchase.purchasedItemId?.includes(item.id)
      ),
    }));
    return purchaseWithListOfPurchaseItem;
  });
}
