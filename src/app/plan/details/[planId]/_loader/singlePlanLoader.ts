import db from "@/infrastructure/database/db";
import { plan, planItem } from "@/lib/schema/plan";
import { asc, desc, eq } from "drizzle-orm";

export async function singlePlanLoader(
  planId: string
): Promise<PurchasePlan | null> {
  const dbResult = await db.query.plan.findFirst({
    where: eq(plan.id, planId),
    columns: {
      id: true,
      totalPrice: true,
      createdAt: true,
    },
    with: {
      planItems: {
        columns: {
          id: true,
          itemId: true,
          quantityInHundreds: true,
          totalPrice: true,
          pricePerUnit: true,
        },
        with: {
          item: {
            columns: {
              name: true,
            },
          },
        },
        orderBy: [asc(planItem.sortOrder)],
      },
    },
    orderBy: [desc(plan.createdAt)],
  });
  if (!dbResult) return null;
  const { planItems, createdAt, id, totalPrice } = dbResult;

  const listOfPlanItem: PurchaseItemDisplay[] = planItems.map(
    ({ id, itemId, pricePerUnit, quantityInHundreds, item: { name } }) => ({
      id,
      pricePerUnit,
      quantityInHundreds,
      name,
      itemId,
    })
  );

  return {
    id,
    createdAt,
    totalPrice,
    listOfPlanItem,
  };
}
