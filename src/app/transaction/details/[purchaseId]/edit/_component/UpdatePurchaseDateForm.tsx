"use client";

import { toast } from "react-toastify";
import { MdSave } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";

import { updatePurchaseDate } from "../_action/updatePurchaseDate.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";

type Props<T> = {
  purchaseId: string;
  newPurchaseDate: string;
  currentPurchaseDate: string;
  onSuccess: () => void;
};

export default function UpdatePurchaseDateHiddenForm({
  purchaseId,
  newPurchaseDate,
  currentPurchaseDate,
  onSuccess,
}: Props<Vendor>) {
  const [wrappedUpdatePurchaseDate, isPending] = useServerAction(
    updatePurchaseDate,
    (msg) => {
      toast.success(msg);
      onSuccess();
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <form
      action={wrappedUpdatePurchaseDate}
      className="relative flex flex-row "
    >
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
        disabled={currentPurchaseDate === newPurchaseDate}
        className=" flex flex-row gap-2 px-2 h-10 items-center bg-green-900 border-t border-b border-gray-500  w-fit hover:bg-green-800 text-xl disabled:bg-gray-700 disabled:text-white/30"
      >
        {isPending ? <LuLoaderCircle className="animate-spin " /> : <MdSave />}
      </button>
    </form>
  );
}
