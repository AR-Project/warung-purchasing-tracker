import db from "@/infrastructure/database/db";
import { plan, planItem } from "@/lib/schema/plan";
import { asc, desc, eq } from "drizzle-orm";

type PlanLoaderReturn = PurchasePlan[];

export async function planLoader(userId: string): Promise<PlanLoaderReturn> {
  const dbResult = await db.query.plan.findMany({
    where: eq(plan.creatorId, userId),
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

  return dbResult.map(({ id, createdAt, totalPrice, planItems }) => {
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
  });
}
