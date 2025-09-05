import db from "@/infrastructure/database/db";

export type ItemWithPrice = {
  id: string;
  name: string;
  lastPrice: number;
  purchasedAt: Date;
  imageUrl?: string;
};

export type CategoryWithItems = {
  name: string;
  id: string;
  items: ItemWithPrice[];
};

export default async function getUserCategoryWithItemLatestPrice(
  requesterUserId: string
): Promise<CategoryWithItems[]> {
  const result = await db.query.category.findMany({
    where: (ctg, { eq }) => eq(ctg.ownerId, requesterUserId),
    columns: {
      id: true,
      name: true,
    },
    with: {
      items: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          purchaseItem: {
            columns: {
              pricePerUnit: true,
              purchasedAt: true,
            },
            with: {
              purchase: {
                columns: {},
                with: {
                  vendor: {
                    columns: {
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: (purchasedItem, { desc }) => [
              desc(purchasedItem.purchasedAt),
            ],
            limit: 1,
          },
          image: {
            columns: {
              url: true,
            },
          },
        },
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
    orderBy: (category, { asc }) => [asc(category.sortOrder)],
  });

  return result.map(({ id, items, name }) => {
    return {
      id,
      name,
      items: items
        .filter((row) => row.purchaseItem.length != 0)
        .map((item) => {
          return {
            id: item.id,
            name: item.name,
            lastPrice: item.purchaseItem[0].pricePerUnit,
            purchasedAt: item.purchaseItem[0].purchasedAt,
            imageUrl: item.image?.url,
          };
        }),
    };
  });
}
