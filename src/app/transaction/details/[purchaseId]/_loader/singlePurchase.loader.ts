import db from "@/infrastructure/database/db";
import { purchases, vendors, purchasedItems, items } from "@/lib/schema/schema";
import { eq, desc } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

export async function singlePurchaseLoader(purchaseId: string) {
  const cb = async (purchaseId: string) => {
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
          modifiedAt: purchases.modifiedAt,
          imageId: purchases.imageId,
        })
        .from(purchases)
        .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
        .where(eq(purchases.id, purchaseId))
        .orderBy(desc(purchases.purchasedAt));

      const allPurchasedItems = await tx
        .select({
          id: purchasedItems.id,
          itemId: items.id,
          name: items.name,
          quantityInHundreds: purchasedItems.quantityInHundreds,
          pricePerUnit: purchasedItems.pricePerUnit,
        })
        .from(purchasedItems)
        .innerJoin(items, eq(purchasedItems.itemId, items.id));

      const purchasedTransactionsWithItem = purchaseTransactions.map(
        (purchase) => ({
          ...purchase,
          items: purchaseTransactions[0].purchasedItemId.map(
            (purchaseItemId) => {
              return allPurchasedItems.filter(
                (item) => item.id === purchaseItemId
              )[0];
            }
          ),
        })
      );

      return purchasedTransactionsWithItem[0];
    });
  };

  const getCachedSinglePurchase = cache(cb, [purchaseId], {
    tags: [purchaseId],
  });

  // return getCachedSinglePurchase(purchaseId);
  return cb(purchaseId);
}
