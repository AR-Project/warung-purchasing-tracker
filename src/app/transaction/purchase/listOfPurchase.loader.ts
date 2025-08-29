"use server";

import { eq, between, desc, ilike, and } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { vendor } from "@/lib/schema/vendor";
import { purchase, purchasedItem } from "@/lib/schema/purchase";
import { item } from "@/lib/schema/item";
import { image } from "@/lib/schema/image";

import { parseRangeFilterToJSDate } from "@/lib/utils/validator";

export async function transactionLoader(
  { range, keyword }: SearchFilter,
  userId: string
): Promise<PurchaseDisplay[]> {
  const dateFilter = parseRangeFilterToJSDate(range);

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
        imageUrl: image.url,
      })
      .from(purchase)
      .innerJoin(vendor, eq(purchase.vendorId, vendor.id))
      .leftJoin(image, eq(purchase.imageId, image.id))
      .where(
        and(
          eq(purchase.ownerId, userId),
          keyword ? ilike(vendor.name, keyword) : undefined,
          dateFilter !== null
            ? between(purchase.purchasedAt, dateFilter.from, dateFilter.to)
            : undefined
        )
      )
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
      .where(
        and(
          eq(purchasedItem.ownerId, userId),
          dateFilter
            ? between(purchasedItem.purchasedAt, dateFilter.from, dateFilter.to)
            : undefined
        )
      )
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
