import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import {
  NewPlanDbPayload,
  NewPlanItemDbPayload,
  plan,
  planItem,
} from "@/lib/schema/plan";

export async function saveNewPlan(
  newPlanPayload: NewPlanDbPayload,
  listOfPlanItem: CreatePlanItemInput[]
): Promise<[string, null] | [null, string]> {
  try {
    const savedPlanId = await db.transaction(async (tx) => {
      const [savedPlan] = await tx
        .insert(plan)
        .values(newPlanPayload)
        .returning({ id: plan.id });

      const listOfPlanItemDbPayload: NewPlanItemDbPayload[] =
        listOfPlanItem.map((item, index) => ({
          ...item,
          sortOrder: index,
          planId: savedPlan.id,
          creatorId: newPlanPayload.creatorId,
        }));

      const planItemIds = await tx
        .insert(planItem)
        .values(listOfPlanItemDbPayload)
        .returning({ id: planItem.id });

      const listOfPlanItemId = planItemIds.map((planItem) => planItem.id);
      await tx
        .update(plan)
        .set({ plannedItemIds: listOfPlanItemId })
        .where(eq(plan.id, savedPlan.id));
      return savedPlan.id;
    });
    return [savedPlanId, null];
  } catch (error) {
    console.log(error);
    return [null, "Fail to save plan"];
  }
}
