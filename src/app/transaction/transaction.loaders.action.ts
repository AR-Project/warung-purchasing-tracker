import db from "@/infrastructure/database/db";
import { purchases, vendors, purchasedItems, items } from "@/lib/schema/schema";
import { eq, between, desc } from "drizzle-orm";

export async function transactionLoader(): Promise<DisplayPurchases> {
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
      })
      .from(purchases)
      .innerJoin(vendors, eq(purchases.vendorId, vendors.id))
      .orderBy(desc(purchases.purchasedAt));
    // .where(
    //   between(
    //     purchases.purchasedAt,
    //     new Date("2024-06-01"),
    //     new Date("2024-06-31")
    //   )
    // );

    const allPurchasedItems = await tx
      .select({
        id: purchasedItems.id,
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
