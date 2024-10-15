import { eq, inArray } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { items, purchasedItems, purchases } from "@/lib/schema/schema";

export async function sortPurchaseItemsLoader(
  purchaseId: string
): Promise<DisplaySingleItem[]> {
  return await db.transaction(async (tx) => {
    const [purchase] = await tx
      .select({ itemList: purchases.purchasedItemId })
      .from(purchases)
      .where(eq(purchases.id, purchaseId));

    const purchaseItemList = await tx
      .select({
        id: purchasedItems.id,
        itemId: purchasedItems.itemId,
        name: items.name,
        quantityInHundreds: purchasedItems.quantityInHundreds,
        pricePerUnit: purchasedItems.pricePerUnit,
      })
      .from(purchasedItems)
      .where(inArray(purchasedItems.id, purchase.itemList))
      .innerJoin(items, eq(purchasedItems.itemId, items.id));

    const list = purchase.itemList.map((purchaseItemId) => {
      const [item] = purchaseItemList.filter(
        (itemList) => itemList.id === purchaseItemId
      );
      return item;
    });
    return list;
  });
}
