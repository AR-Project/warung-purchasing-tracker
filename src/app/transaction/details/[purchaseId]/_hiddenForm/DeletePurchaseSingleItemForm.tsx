"use client";

import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";

import { deleteSingleItemAction } from "../_action/deleteSingleItem.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";

type Props = {
  purchaseId: string;
  purchaseItemId: string;
};

export default function DeletePurchaseSingleItemForm({
  purchaseId,
  purchaseItemId,
}: Props) {
  const [formAction] = useServerAction(
    deleteSingleItemAction,
    (msg, err) => {
      toast.success(msg);
    },
    (err) => toast.error(err)
  );

  return (
    <>
      <form action={formAction}>
        <input
          type="hidden"
          id="purchase-id"
          name="purchase-id"
          value={purchaseId}
        />
        <input
          type="hidden"
          name="purchase-item-id"
          id="purchase-item-id"
          value={purchaseItemId}
        />
        <button
          type="submit"
          className="bg-black rounded-sm text-red-600 border border-red-800 h-10 aspect-square flex flex-row justify-center items-center text-xl"
        >
          <MdDelete />
        </button>
      </form>
    </>
  );
}
