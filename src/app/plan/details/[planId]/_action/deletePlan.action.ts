"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";

import db from "@/infrastructure/database/db";
import { verifyUserAccess } from "@/lib/utils/auth";
import { plan } from "@/lib/schema/plan";
import { allRole } from "@/lib/const";
import ClientError from "@/lib/exception/ClientError";

import { actionErrorDecoder } from "@/lib/exception/errorDecoder";

const schema = z.string();

export async function deletePlanAction(formData: FormData): Promise<FormState> {
  const [user, authError] = await verifyUserAccess(allRole);
  if (authError) return { error: authError };

  const { data: planIdToDelete, error: payloadError } = schema.safeParse(
    formData.get("plan-id")
  );
  if (payloadError) return { error: "Invalid Payload" };

  let invariantError: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const planToDelete = await tx.query.plan.findFirst({
        where: (plan, { eq }) => eq(plan.id, planIdToDelete),
      });
      if (!planToDelete) throw new ClientError("Invalid Plan id");
      if (planToDelete.creatorId !== user.userId)
        throw new ClientError("Not Allowed");

      await tx.delete(plan).where(eq(plan.id, planIdToDelete));
    });

    revalidatePath(`/plan`);
    return { message: `Plan deleted` };
  } catch (error) {
    return actionErrorDecoder(error);
  }
}
