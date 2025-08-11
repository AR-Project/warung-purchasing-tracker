"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import { DateTime } from "luxon";

import db from "@/infrastructure/database/db";
import { purchasedItem, purchase } from "@/lib/schema/purchase";
import {
  NewPurchaseArchiveDbPayload,
  purchaseArchive,
} from "@/lib/schema/archive";
import { adminManagerRole } from "@/lib/const";
import { generateId } from "@/lib/utils/generator";
import { verifyUserAccess } from "@/lib/utils/auth";
import { generateImageFilePath } from "@/lib/utils/fileSystem";
import ClientError from "@/lib/exception/ClientError";

const schema = z.string();

export async function deletePurchase(
  formData: FormData
): Promise<FormState<void>> {
  const purchaseIdRaw = formData.get("purchase-id");

  const [user, authError] = await verifyUserAccess(adminManagerRole);
  if (authError) return { error: authError };

  const { data: purchaseIdToDelete, error: payloadError } =
    schema.safeParse(purchaseIdRaw);
  if (payloadError) return { error: "Invalid Payload" };

  try {
    await db.transaction(async (tx) => {
      // Validate current purchase
      const purchaseToDelete = await tx.query.purchase.findFirst({
        with: { image: true },
        where: (purchase, { eq }) => eq(purchase.id, purchaseIdToDelete),
      });
      if (!purchaseToDelete) throw new ClientError("invalid purchase id");

      // Validate authorization on current purchase
      const { creatorId, ownerId } = purchaseToDelete;
      if (![creatorId, ownerId].includes(user.userId))
        throw new ClientError("Not Allowed");

      const purchaseItems = await tx.query.purchasedItem.findMany({
        with: {
          item: {
            columns: {
              name: true,
            },
          },
        },
        where: (purchasedItem, { eq }) =>
          eq(purchasedItem.purchaseId, purchaseIdToDelete),
      });

      const listOfPurchaseItem = purchaseItems.map(({ item, ...rest }) => ({
        ...rest,
        itemName: item.name,
      }));

      // Archival step
      const purchaseArchiveDbPayload: NewPurchaseArchiveDbPayload = {
        id: generateId(20),
        description: "Purchase Deletion",
        ownerId: user.parentId,
        creatorId: user.userId,
        data: {
          purchase: purchaseToDelete,
          listOfPurchaseItem,
        },
      };

      // Commit action to database
      await tx.insert(purchaseArchive).values(purchaseArchiveDbPayload);
      await tx.delete(purchase).where(eq(purchase.id, purchaseIdToDelete));
      await tx
        .delete(purchasedItem)
        .where(eq(purchasedItem.purchaseId, purchaseIdToDelete));

      // Delete purchase image if present
      if (purchaseToDelete.image !== null) {
        const { id, uploadedAt } = purchaseToDelete.image;
        const uploadAtDateString = DateTime.fromJSDate(uploadedAt).toISODate();
        if (!uploadAtDateString) throw new Error("Date Invalid");

        const imageFilePath = generateImageFilePath(id, uploadAtDateString);
        await fs.stat(imageFilePath);
        await fs.unlink(imageFilePath);
      }
    });

    revalidatePath(`/transaction/purchase`);
    return { message: `Purchase transaction deleted` };
  } catch (error) {
    return {
      error: error instanceof ClientError ? error.message : "internal Error",
    };
  }
}
