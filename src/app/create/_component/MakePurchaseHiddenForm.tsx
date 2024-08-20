"use client";

import { useFormState } from "react-dom";
import { makePurchase } from "../action";
import { useEffect } from "react";
import { toast } from "react-toastify";

type Props = {
  purchasedAt: string;
  vendorId: string;
  itemsList: PurchasedItem[];
  totalPurchase: number;
};

function MakePurchaseHiddenForm({
  purchasedAt,
  vendorId,
  itemsList,
  totalPurchase,
}: Props) {
  const [state, formAction] = useFormState<FormState<string>, FormData>(
    makePurchase,
    {}
  );

  const purchasedPayload: PurchasedItemPayload[] = itemsList.map((item) => ({
    itemId: item.itemId,
    quantityInHundreds: item.quantityInHundreds,
    pricePerUnit: item.pricePerUnit,
    totalPrice: item.totalPrice,
  }));

  const isDataValid = () => {
    if (purchasedPayload.length > 0 && purchasedAt && vendorId && totalPurchase)
      return true;
    return false;
  };

  useEffect(() => {
    if (state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="vendor-id" value={vendorId} />
      <input type="hidden" name="purchased-at" value={purchasedAt} />
      <input type="hidden" name="total-price" value={totalPurchase} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(purchasedPayload)}
      />

      <button
        className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto disabled:bg-blue-800/50 disabled:cursor-not-allowed disabled:text-white/50"
        disabled={!isDataValid()}
      >
        Simpan Transaksi
      </button>
    </form>
  );
}

export default MakePurchaseHiddenForm;
