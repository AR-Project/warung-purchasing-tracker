"use client";

import { Button } from "@headlessui/react";
import { MdSave } from "react-icons/md";

type Props = {
  purchaseId: string;
  purchaseItemId: string;
  updatedQuantityInHundred: number | "";
  updatedPricePerUnit: number | "";
  formAction: (payload: FormData) => void;
};

export default function ItemDataForm({
  purchaseId,
  purchaseItemId,
  updatedQuantityInHundred,
  updatedPricePerUnit,
  formAction,
}: Props) {
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
        className=" rounded-md  border border-gray-600 bg-blue-800 h-10 gap-2 px-2 flex flex-row justify-center items-center hover:bg-blue-600"
      >
        <MdSave className="text-xl" /> Simpan
      </Button>
    </form>
  );
}
