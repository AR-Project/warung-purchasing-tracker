"use server";

import db from "@/infrastructure/database/db";
import { validateUser } from "@/lib/utils/auth";

export async function getCategory() {
  const [user, error] = await validateUser();
  if (error !== null) return null;

  const categoryList = await db.query.category.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: (category, { eq }) => eq(category.ownerId, user.parentId),
  });

  if (categoryList.length === 0) return null;
  return categoryList;
}
