import db from "@/infrastructure/database/db";

export async function manageCategoryDetailLoader(categoryId: string) {
  return await db.query.category.findFirst({
    where: (ctg, { eq }) => eq(ctg.id, categoryId),
    with: {
      items: {
        orderBy: (item, { asc }) => [asc(item.sortOrder)],
      },
    },
  });
}
