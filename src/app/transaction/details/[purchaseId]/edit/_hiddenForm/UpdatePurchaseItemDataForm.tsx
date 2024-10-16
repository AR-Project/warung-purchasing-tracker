"use client";

import { Button } from "@headlessui/react";
import { MdSave } from "react-icons/md";
import { toast } from "react-toastify";

import { useServerActionWithState } from "@/presentation/hooks/useServerActionWithState";

import { editDataSingleItem } from "../_action/editDataSingleItem.action";

type Props = {
  purchaseId: string;
  purchaseItemId: string;
  updatedQuantityInHundred: number | "";
  updatedPricePerUnit: number | "";
  onSuccess: () => void;
};

export default function UpdatePurchaseItemDataForm({
  purchaseId,
  purchaseItemId,
  updatedQuantityInHundred,
  updatedPricePerUnit,
  onSuccess,
}: Props) {
  const [formAction, isPending] = useServerActionWithState(
    editDataSingleItem,
    (msg) => {
      onSuccess();
      toast.success(msg);
    },
    (err) => {
      toast.error(err);
    }
  );
  return (
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
      <input
        type="hidden"
        name="updated-quantity-in-hundred"
        id="updated-quantity-in-hundred"
        value={updatedQuantityInHundred}
      />
      <input
        type="hidden"
        name="updated-price-per-unit"
        id="updated-price-per-unit"
        value={updatedPricePerUnit}
      />
      <Button
        type="submit"
        className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-red-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
      >
        {isPending ? (
          <>Sedang diproses... </>
        ) : (
          <>
            <MdSave className="text-xl" /> Simpan
          </>
        )}
      </Button>
    </form>
  );
}
