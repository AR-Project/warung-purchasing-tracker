"use client";

import { toast } from "react-toastify";
import { MdSave } from "react-icons/md";

import { useForm } from "@/presentation/hooks/useForm";
import { updatePurchaseItemAction } from "../_action/updatePurchaseItem.action";

type Props<T> = {
  purchaseId: string;
  payload: CreatePurchaseItemPayload[];
  onSuccess: () => void;
};

export default function UpdatePurchaseItemForm({
  purchaseId,
  payload,
  onSuccess,
}: Props<Vendor>) {
  const [formAction] = useForm(
    updatePurchaseItemAction,
    (msg, err) => {
      toast.success(msg);
      onSuccess();
    },
    (err) => toast.error(err)
  );

  return (
    <form action={formAction} className="flex flex-row ">
      <input
        type="hidden"
        name="purchase-id"
        id="purchase-id"
        value={purchaseId}
      />
      <input
        type="hidden"
        name="items-to-add"
        id="items-to-add"
        value={JSON.stringify(payload)}
      />
      <button
        type="submit"
        className=" flex flex-row gap-2 px-2 h-10 items-center bg-green-900 border-t border-b border-gray-500  w-fit hover:bg-green-800"
      >
        <MdSave className="text-xl" />
      </button>
    </form>
  );
}
