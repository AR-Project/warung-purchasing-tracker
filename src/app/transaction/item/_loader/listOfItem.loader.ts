"use server";

import db from "@/infrastructure/database/db";
import { category, items } from "@/lib/schema/item";
import { purchasedItems } from "@/lib/schema/schema";
import { and, asc, between, desc, eq, inArray } from "drizzle-orm";
import { DateTime } from "luxon";

type Data = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
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
    ? DateTime.fromISO(dateFilter.from).toJSDate()
    : DEFAULT_DATE_FROM;
  const dateFilterTo = dateFilter
    ? DateTime.fromISO(dateFilter.to).toJSDate()
    : DEFAULT_DATE_TO;

  const result = await db.query.items.findMany({
    where: eq(items.ownerId, requesterId),
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
        where: between(
          purchasedItems.purchasedAt,
          dateFilterFrom,
          dateFilterTo
        ),
      },
      category: {
        columns: {
          name: true,
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
    }))
    .sort((item, nextItem) => nextItem.quantity - item.quantity);
}
