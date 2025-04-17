import { category, CreateCategoryDbPayload } from "@/lib/schema/item";
import db from "../database/db";
import { eq } from "drizzle-orm";

type CategoryId = string;
type ErrorMessage = string;
type DefaultResult<T = string> = [T, null] | [null, ErrorMessage];

type CreateCategoryResult = DefaultResult<CategoryId>;

export async function createCategory(
  payload: CreateCategoryDbPayload
): Promise<CreateCategoryResult> {
  let invariantError: string | undefined;
  try {
    const categories = await db.query.category.findMany({
      where: eq(category.ownerId, payload.ownerId),
      columns: { id: true },
    });
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
        .values({ ...payload, sortOrder: categories.length + 1 })
        .returning({ id: category.id });
      return categoryCreated;
    });
    return [categoryCreated.id, null];
  } catch (error) {
    return [null, invariantError ? invariantError : "internal error"];
  }
}
