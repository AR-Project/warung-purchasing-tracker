import { category, CreateCategoryDbPayload } from "@/lib/schema/item";
import db from "../database/db";
import { eq } from "drizzle-orm";

type CategoryId = string;
type ErrorMessage = string;

type CreateCategoryReturn = [CategoryId, null] | [null, ErrorMessage];

export async function createCategory(
  payload: CreateCategoryDbPayload
): Promise<CreateCategoryReturn> {
  let invariantError: string | undefined;
  try {
    const categoryCreated = await db.transaction(async (tx) => {
      const existedCategory = await tx
        .select()
        .from(category)
        .where(eq(category.name, payload.name));

      if (existedCategory.length > 0) {
        invariantError = "Category name already used";
        tx.rollback();
      }

      const [categoryCreated] = await tx
        .insert(category)
        .values(payload)
        .returning({ id: category.id });
      return categoryCreated;
    });
    return [categoryCreated.id, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}
