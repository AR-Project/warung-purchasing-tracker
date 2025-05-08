"use server";

import { z } from "zod";
import { DrizzleError, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/infrastructure/database/db";
import { getUserInfo } from "@/lib/utils/auth";
import { user } from "@/lib/schema/user";
import {
  NewPurchaseArchiveDbPayload,
  purchaseArchive,
} from "@/lib/schema/archive";
import { generateId } from "@/lib/utils/generator";
import { item } from "@/lib/schema/item";
import { auth } from "@/auth";
import { plan } from "@/lib/schema/plan";

export async function deletePlanAction(
  formData: FormData
): Promise<FormState<void>> {
  const planIdRaw = formData.get("plan-id");

  const session = await auth();
  if (!session) return { error: "Need to Login first" };
  const { userId } = session.user;

  const schema = z.string();
  const { data: planIdToDelete } = schema.safeParse(planIdRaw);
  if (!planIdToDelete) return { error: "Invalid Payload" };

  const allowedRole: AvailableUserRole[] = [
    "admin",
    "manager",
    "staff",
    "guest",
  ];

  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      // Validate user role
      const [userData] = await tx
        .select({
          role: user.role,
        })
        .from(user)
        .where(eq(user.id, session.user.userId));
      if (!allowedRole.includes(userData.role)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      // Validate current plan
      const planToDelete = await tx
        .select()
        .from(plan)
        .where(eq(plan.id, planIdToDelete));
      if (planToDelete.length == 0) {
        invariantError = "invalid Plan id";
        tx.rollback();
      }

      // Validate authorization on current plan
      const { creatorId } = planToDelete[0];
      if (![creatorId].includes(userId)) {
        invariantError = "Not Allowed";
        tx.rollback();
      }

      //   // Archival step
      //   const purchaseArchiveDbPayload: NewPurchaseArchiveDbPayload = {
      //     id: generateId(20),
      //     description: "Purchase Deletion",
      //     ownerId: parentId,
      //     creatorId: userId,
      //     data: {
      //       purchase: planToDelete[0],
      //       listOfPurchaseItem,
      //     },
      //   };

      // Commit action to database
      //   await tx.insert(purchaseArchive).values(purchaseArchiveDbPayload);
      await tx.delete(plan).where(eq(plan.id, planIdToDelete));
      //   await tx
      //     .delete(purchasedItems)
      //     .where(eq(purchasedItems.purchaseId, purchaseIdToDelete));
    });

    revalidatePath(`/plan`);
    return { message: `Plan deleted` };
  } catch (error) {
    return { error: invariantError || "Internal Error" };
  }
}
