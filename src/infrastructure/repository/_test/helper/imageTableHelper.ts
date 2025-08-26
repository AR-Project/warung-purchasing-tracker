import db from "@/infrastructure/database/db";
import { image, NewImageDbPayload } from "@/lib/schema/image";
import { item, NewItemDbPayload } from "@/lib/schema/item";

type AddFnParam = Partial<NewImageDbPayload>;

export const imageTableHelper = {
  /** Adding item required creatorId, and ownerId */
  add: async (payload: AddFnParam) => {
    const {
      id = "000",
      creatorId = "",
      ownerId = "",
      url = "Test",
      serverFileName = "defaultUser/image",
      originalFileName = "from-test-image",
    } = payload;

    return await db
      .insert(image)
      .values({ id, creatorId, ownerId, url, serverFileName, originalFileName })
      .returning();
  },
  findAll: async () => {
    return db.query.image.findMany();
  },
  findById: async (itemId: string) => {
    return db.query.image.findMany({
      where: (image, { eq }) => eq(image.id, itemId),
    });
  },

  findByOwnerId: async (userId: string) => {
    return db.query.image.findMany({
      where: (image, { eq }) => eq(image.ownerId, userId),
    });
  },
  clean: async () => {
    return db.delete(image);
  },
};
