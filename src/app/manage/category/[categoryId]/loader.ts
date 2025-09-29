import db from "@/infrastructure/database/db";

export async function manageCategoryDetailLoader(categoryId: string) {
  const res = await db.query.category.findFirst({
    where: (ctg, { eq }) => eq(ctg.id, categoryId),
    with: {
      items: {
        with: {
          image: true
        },
        orderBy: (item, { asc }) => [asc(item.sortOrder)],
      },
    },
  });

  if(!res) return

  const mappedItems = res.items.map(({image, ...rest}) => ({...rest, imageUrl: image?.url}))

  const {items, ...rest} = res

  return {...rest, items: mappedItems}
}
