import db from "@/infrastructure/database/db";

export async function singlePurchaseLoader(purchaseId: string) {
  const result = await db.transaction(async (tx) => {
    const purchase = await tx.query.purchase.findFirst({
      where: (purchase, { eq }) => eq(purchase.id, purchaseId),
      orderBy: (purchase, { desc }) => desc(purchase.purchasedAt),
      with: {
        vendor: { columns: { name: true } },
        image: { columns: { url: true } },
      },
    });
    if (!purchase) return null;

    const purchaseItemsNested = await tx.query.purchasedItem.findMany({
      columns: {
        id: true,
        quantityInHundreds: true,
        pricePerUnit: true,
        itemId: true,
      },
      where: (purchasedItem, { eq }) =>
        eq(purchasedItem.purchaseId, purchaseId),
      with: { item: { columns: { name: true } } },
    });

    const purchaseItems = purchaseItemsNested.map(({ item, ...rest }) => ({
      ...rest,
      name: item.name,
    }));
    const { vendor, image, purchasedItemId, ...rest } = purchase;
    const purchaseWithDetail = {
      ...rest,
      items: purchasedItemId.map((purchaseItemId) => {
        return purchaseItems.filter((item) => item.id === purchaseItemId)[0];
      }),
      vendorName: vendor.name,
      imageUrl: image ? image.url : null,
    };

    return purchaseWithDetail;
  });
  return result;
}
