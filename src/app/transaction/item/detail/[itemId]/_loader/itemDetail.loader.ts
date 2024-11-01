import db from "@/infrastructure/database/db";
import { items } from "@/lib/schema/item";
import { purchasedItems, purchases } from "@/lib/schema/schema";
import { asc, desc, eq } from "drizzle-orm";

type LoaderResponse = {
  purchaseItemHistory: {
    purchaseId: string;
    purchaseDate: Date;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
  }[];
  id: string;
  name: string;
  imageId: string | null;
  createdAt: Date;
  modifiedAt: Date;
};

export async function itemDetailLoader(
  itemId: string
): Promise<LoaderResponse> {
  const [item] = await db.select().from(items).where(eq(items.id, itemId));
  const purchaseItemHistory = await db
    .select({
      purchaseId: purchasedItems.purchaseId,
      purchaseDate: purchases.purchasedAt,
      quantityInHundreds: purchasedItems.quantityInHundreds,
      pricePerUnit: purchasedItems.pricePerUnit,
      totalPrice: purchasedItems.totalPrice,
    })
    .from(purchasedItems)
    .where(eq(purchasedItems.itemId, itemId))
    .innerJoin(purchases, eq(purchasedItems.purchaseId, purchases.id))
    .orderBy(desc(purchases.purchasedAt));
  return { ...item, purchaseItemHistory: purchaseItemHistory };
}
