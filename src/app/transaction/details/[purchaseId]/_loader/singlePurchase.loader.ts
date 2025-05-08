import db from "@/infrastructure/database/db";
import { item } from "@/lib/schema/item";
import { vendor } from "@/lib/schema/vendor";
import { purchase, purchasedItem } from "@/lib/schema/purchase";
import { eq, desc } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

export async function singlePurchaseLoader(purchaseId: string) {
  const cb = async (purchaseId: string) => {
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
          modifiedAt: purchase.modifiedAt,
          imageId: purchase.imageId,
        })
        .from(purchase)
        .innerJoin(vendor, eq(purchase.vendorId, vendor.id))
        .where(eq(purchase.id, purchaseId))
        .orderBy(desc(purchase.purchasedAt));

      const allPurchasedItems = await tx
        .select({
          id: purchasedItem.id,
          itemId: item.id,
          name: item.name,
          quantityInHundreds: purchasedItem.quantityInHundreds,
          pricePerUnit: purchasedItem.pricePerUnit,
        })
        .from(purchasedItem)
        .innerJoin(item, eq(purchasedItem.itemId, item.id));

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
