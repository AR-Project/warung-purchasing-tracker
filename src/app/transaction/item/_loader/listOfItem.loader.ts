import db from "@/infrastructure/database/db";
import { parseRangeFilterToJSDate } from "@/lib/utils/validator";

type Data = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  imageUrl: string | null;
};

export async function listOfItemsLoader(
  requesterId: string,
  dateFilter?: RangeFilter
): Promise<Data[]> {
  const filter = parseRangeFilterToJSDate(dateFilter);

  const result = await db.query.item.findMany({
    where: (item, { eq }) => eq(item.ownerId, requesterId),
    columns: {
      id: true,
      name: true,
    },
    with: {
      purchaseItem: {
        columns: {
          id: true,
          quantityInHundreds: true,
        },
        where: (purchasedItem, { between }) =>
          filter
            ? between(purchasedItem.purchasedAt, filter.from, filter.to)
            : undefined,
      },
      category: {
        columns: {
          name: true,
        },
      },
      image: {
        columns: {
          url: true,
        },
      },
    },
  });
  return result
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity:
        item.purchaseItem.reduce((prev, current) => {
          return prev + current.quantityInHundreds;
        }, 0) / 100,
      category: item.category ? item.category.name : null,
      imageUrl: item.image ? item.image.url : null,
    }))
    .sort((item, nextItem) => nextItem.quantity - item.quantity);
}
