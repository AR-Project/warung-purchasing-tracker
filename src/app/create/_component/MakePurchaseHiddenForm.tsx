"use client";

import { useFormState } from "react-dom";
import { makePurchase } from "../action";
import { toast } from "react-toastify";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";

type Props = {
  purchasedAt: string;
  vendorId: string;
  itemsList: PurchasedItem[];
  totalPurchase: number;
  image: Blob | null;
  clearFrom: () => void;
};

function MakePurchaseHiddenForm({
  purchasedAt,
  vendorId,
  itemsList,
  totalPurchase,
  image,
  clearFrom,
}: Props) {
  const [state, formAction] = useFormState<FormState<string>, FormData>(
    makePurchase,
    {}
  );

  useStateChanged<FormState<string>>(() => {
    if (state.message) {
      toast.success(state.message);
      clearFrom();
    }
    if (state.error) toast.error(state.error);
  }, state);

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

  function interceptAction(formData: FormData) {
    if (image) {
      formData.append("image", image, "hidden-upload.jpg");
    }
    formAction(formData);
  }

  return (
    <form action={interceptAction}>
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
