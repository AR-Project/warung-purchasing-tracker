"use server";

import db from "@/infrastructure/database/db";
import { category } from "@/lib/schema/category";
import { asc, eq } from "drizzle-orm";

export default async function categoriesLoader(requesterId: string) {
  return await db.query.category.findMany({
    where: eq(category.ownerId, requesterId),
    orderBy: asc(category.sortOrder),
    with: {
      items: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}
