"use client";

import { MdDelete } from "react-icons/md";

type Props = {
  isActive: boolean;
  purchaseId: string;
  purchaseItemId: string;
  formAction: (payload: FormData) => void;
};

export default function DeletePurchaseSingleItemForm({
  isActive,
  purchaseId,
  purchaseItemId,
  formAction,
}: Props) {
  return (
    <form
      action={formAction}
      className={`transition-transform ease-in-out duration-100 absolute right-0 top-1/2 -translate-y-1/2 ${
        isActive ? "translate-x-[0%]" : "translate-x-[100%]"
      }
        `}
    >
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
  );
}
