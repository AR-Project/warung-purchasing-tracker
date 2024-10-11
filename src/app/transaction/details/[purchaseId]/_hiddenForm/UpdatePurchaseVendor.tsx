import { toast } from "react-toastify";
import { MdSave } from "react-icons/md";

import { updatePurchaseVendor } from "../_action/updatePurchaseVendor";
import { useServerActionWithState } from "@/presentation/hooks/useServerActionWithState";

type Props<T> = {
  purchaseId: string;
  newPurchaseVendorId: string;
  onSuccess: () => void;
};

export default function UpdatePurchaseVendorHiddenForm({
  purchaseId,
  newPurchaseVendorId,
  onSuccess,
}: Props<Vendor>) {
  const [formAction] = useServerActionWithState(
    updatePurchaseVendor,
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
        name="new-purchase-vendor-id"
        id="new-purchase-vendor-id"
        value={newPurchaseVendorId}
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
