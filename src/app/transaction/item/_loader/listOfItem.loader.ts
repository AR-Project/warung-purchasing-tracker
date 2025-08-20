"use server";

import db from "@/infrastructure/database/db";
import { item } from "@/lib/schema/item";
import { category } from "@/lib/schema/category";
import { purchasedItem } from "@/lib/schema/purchase";
import { and, asc, between, desc, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";

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
  const DEFAULT_DATE_FROM = DateTime.now()
    .startOf("day")
    .minus({ years: 5 })
    .toJSDate();
  const DEFAULT_DATE_TO = DateTime.now().endOf("day").toJSDate();

  const dateFilterFrom = dateFilter
    ? DateTime.fromISO(dateFilter.from).startOf("day").toJSDate()
    : DEFAULT_DATE_FROM;
  const dateFilterTo = dateFilter
    ? DateTime.fromISO(dateFilter.to).endOf("day").toJSDate()
    : DEFAULT_DATE_TO;

  const result = await db.query.item.findMany({
    where: eq(item.ownerId, requesterId),
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
        where: between(purchasedItem.purchasedAt, dateFilterFrom, dateFilterTo),
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
