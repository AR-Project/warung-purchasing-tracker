import { eq, inArray, sql, SQL } from "drizzle-orm";

import { item, NewItemDbPayload } from "@/lib/schema/item";
import db from "@/infrastructure/database/db";
import { arraysHaveEqualElements } from "@/lib/utils/validator";

export type CreateItemRepoPayload = {
  id: string;
  name: string;
  ownerId: string;
  creatorId: string;
  categoryId?: string;
};

type CreateItemRepoResult = SafeResult<{
  id: string;
  name: string;
  categoryId: string;
}>;

/**
 * Create Item Repository. Not including `categoryId` fallback to owners/parent users default.
 */
export async function create(
  payload: CreateItemRepoPayload
): Promise<CreateItemRepoResult> {
  let invariantError: string | undefined;

  try {
    const itemCreated = await db.transaction(async (tx) => {
      const { categoryId, ...rest } = payload;
      const dbPayload: NewItemDbPayload = {
        ...rest,
        categoryId: "",
        sortOrder: 0,
      };

      if (categoryId) {
        const category = await tx.query.category.findMany({
          where: (category, { eq }) => eq(category.id, categoryId),
        });

        if (category.length === 0) {
          invariantError = "categoryId invalid";
          tx.rollback();
        }

        // modify dbPayload
        dbPayload.categoryId = categoryId;
        dbPayload.sortOrder = await tx.$count(
          item,
          eq(item.categoryId, categoryId)
        );
      } else {
        const [{ defaultCategory }] = await tx.query.user.findMany({
          columns: { defaultCategory: true },
          where: (user, { eq }) => eq(user.id, dbPayload.ownerId),
        });
        if (!defaultCategory) {
          tx.rollback();
          throw new Error(
            "should be impossible - just for supress typescript error"
          );
        }

        // modify dbPayload
        dbPayload.categoryId = defaultCategory;
        dbPayload.sortOrder = await tx.$count(
          item,
          eq(item.categoryId, defaultCategory)
        );
      }

      const [itemCreated] = await db.insert(item).values(dbPayload).returning({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
      });
      return itemCreated;
    });
    return [itemCreated, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

export type UpdateItemRepoPayload = {
  id: string;
  newName: string;
  parentId: string;
  userId: string;
};

/**
 * UNTESTED
 */
export async function update(
  payload: UpdateItemRepoPayload
): Promise<SafeResult<{ id: string; name: string }>> {
  let invariantError: string | undefined;

  try {
    const result = await db.transaction(async (tx) => {
      const currentItem = await tx.query.item.findMany({
        where: (item, { eq }) => eq(item.id, payload.id),
      });

      if (currentItem.length === 0) {
        invariantError = "itemId invalid";
        tx.rollback();
      }

      const { ownerId, creatorId } = currentItem[0];
      if (![ownerId, creatorId].includes(payload.parentId)) {
        invariantError = "update unauthorized";
        tx.rollback();
      }

      const [updatedItem] = await db
        .update(item)
        .set({ name: payload.newName })
        .where(eq(item.id, payload.id))
        .returning({ id: item.id, name: item.name });

      return updatedItem;
    });
    return [result, null];
  } catch (_) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}

export type UpdateOrderItemRepoPayload = {
  categoryId: string;
  newOrder: string[];
  userId: string;
  parentId: string;
};

export async function updateSortOrder(
  payload: UpdateOrderItemRepoPayload
): Promise<SafeResult<"ok">> {
  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const data = await tx.query.category.findMany({
        columns: {
          id: true,
        },
        with: {
          items: {
            columns: {
              id: true,
              sortOrder: true,
            },
            orderBy: (item, { asc }) => asc(item.sortOrder),
          },
        },
        where: (category, { eq }) => eq(category.id, payload.categoryId),
      });

      if (data.length === 0) {
        invariantError = "categoryId invalid";
        tx.rollback();
      }

      const mappedItemIds = data[0].items.map((item) => item.id);

      if (arraysHaveEqualElements(mappedItemIds, payload.newOrder) === false) {
        invariantError = "newOrder invalid";
        tx.rollback();
      }

      const sqlChunks: SQL[] = [];
      sqlChunks.push(sql`(case`);
      payload.newOrder.forEach((id, index) => {
        sqlChunks.push(sql`when ${item.id} = ${id} then ${index}::INTEGER`);
      });
      sqlChunks.push(sql`end)`);
      const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

      await tx
        .update(item)
        .set({ sortOrder: finalSql })
        .where(inArray(item.id, payload.newOrder));
    });

    return ["ok", null];
  } catch (error) {
    return [null, invariantError ? invariantError : "Internal Error"];
  }
}

const itemRepo = {
  create,
  update,
};

export default itemRepo;
