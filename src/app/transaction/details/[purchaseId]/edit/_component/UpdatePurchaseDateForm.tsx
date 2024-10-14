"use client";

import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { MdSave, MdUndo } from "react-icons/md";

import { useStateChanged } from "@/presentation/hooks/useStateChanged";
import { updatePurchaseDate } from "../_action/updatePurchaseDate.action";

type Props<T> = {
  purchaseId: string;
  newPurchaseDate: string;
  onSuccess: () => void;
};

export default function UpdatePurchaseDateHiddenForm({
  purchaseId,
  newPurchaseDate,
  onSuccess,
}: Props<Vendor>) {
  const [state, formAction] = useFormState<FormState<void>, FormData>(
    updatePurchaseDate,
    {}
  );

  useStateChanged(() => {
    if (state.message) {
      toast.success(state.message);
      onSuccess();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, state);

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
        name="new-purchase-date"
        id="new-purchase-date"
        value={newPurchaseDate}
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
