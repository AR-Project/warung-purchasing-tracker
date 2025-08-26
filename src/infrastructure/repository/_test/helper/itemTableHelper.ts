import db from "@/infrastructure/database/db";
import { item, NewItemDbPayload } from "@/lib/schema/item";

type AddFnParam = Omit<NewItemDbPayload, "name" | "id"> &
  Partial<Pick<NewItemDbPayload, "name" | "id">>;

export const itemTableHelper = {
  /** Adding item required categoryId, and userId */
  add: async (payload: AddFnParam) => {
    const {
      id = "000",
      categoryId,
      creatorId,
      ownerId,
      name = "Test",
      imageId,
      sortOrder,
    } = payload;

    return db
      .insert(item)
      .values({
        id,
        categoryId,
        creatorId,
        ownerId,
        name,
        imageId,
        sortOrder,
      })
      .returning();
  },
  findAll: async () => {
    return db.select().from(item);
  },
  findById: async (itemId: string) => {
    return db.query.item.findMany({
      where: (item, { eq }) => eq(item.id, itemId),
    });
  },

  findByUserId: async (userId: string) => {
    return db.query.item.findMany({
      where: (item, { eq }) => eq(item.ownerId, userId),
    });
  },
  findByCategoryId: async (categoryId: string) => {
    return db.query.item.findMany({
      where: (item, { eq }) => eq(item.categoryId, categoryId),
      orderBy: (item, { asc }) => asc(item.sortOrder),
    });
  },
  clean: async () => {
    return db.delete(item);
  },
};
