import { eq, inArray } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { purchasedItem, purchase } from "@/lib/schema/purchase";
import { item } from "@/lib/schema/item";

export async function sortPurchaseItemsLoader(
  purchaseId: string
): Promise<PurchaseItemDisplay[]> {
  return await db.transaction(async (tx) => {
    const [purchaseResult] = await tx
      .select({ itemList: purchase.purchasedItemId })
      .from(purchase)
      .where(eq(purchase.id, purchaseId));

    const purchaseItemList = await tx
      .select({
        id: purchasedItem.id,
        itemId: purchasedItem.itemId,
        name: item.name,
        quantityInHundreds: purchasedItem.quantityInHundreds,
        pricePerUnit: purchasedItem.pricePerUnit,
      })
      .from(purchasedItem)
      .where(inArray(purchasedItem.id, purchaseResult.itemList))
      .innerJoin(item, eq(purchasedItem.itemId, item.id));

    const list = purchaseResult.itemList.map((purchaseItemId) => {
      const [item] = purchaseItemList.filter(
        (itemList) => itemList.id === purchaseItemId
      );
      return item;
    });
    return list;
  });
}
