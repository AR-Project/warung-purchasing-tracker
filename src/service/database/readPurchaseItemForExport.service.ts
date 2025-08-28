import db from "@/infrastructure/database/db";
import { item } from "@/lib/schema/item";
import { purchasedItem } from "@/lib/schema/purchase";
import { sql, and, eq, between, desc, count } from "drizzle-orm";

type DateRange = {
  from: Date;
  to: Date;
};

export async function readPurchaseItemForExport(
  user: UserSession,
  dateRange: DateRange
) {
  const userPurchasedItem = db.$with("user_purchased_item").as(
    db
      .select({
        itemId: purchasedItem.itemId,
        txCount: count(purchasedItem.id).as("tx_count"),
        quantityInHundredsSum:
          sql<number>`sum(${purchasedItem.quantityInHundreds})`
            .mapWith(Number)
            .as("quantity_in_hundreds_sum"),
        totalTx: sql<number>`sum(${purchasedItem.totalPrice})`
          .mapWith(Number)
          .as("total_price_sum"),
      })
      .from(purchasedItem)
      .groupBy(({ itemId }) => itemId)
      .where(
        and(
          eq(purchasedItem.ownerId, user.parentId),
          between(purchasedItem.purchasedAt, dateRange.from, dateRange.to)
        )
      )
  );

  return await db
    .with(userPurchasedItem)
    .select({
      name: item.name,
      txCount: userPurchasedItem.txCount,
      quantityInHundredsSum: userPurchasedItem.quantityInHundredsSum,
      totalPriceSum: userPurchasedItem.totalTx,
    })
    .from(userPurchasedItem)
    .innerJoin(item, eq(item.id, userPurchasedItem.itemId))
    .orderBy(({ quantityInHundredsSum }) => desc(quantityInHundredsSum));
}
