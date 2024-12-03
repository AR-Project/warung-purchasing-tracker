import { DisplaySingleItem } from "@/app/_component/DisplaySingleItem";
import { formatNumberToIDR } from "@/lib/utils/formatter";
import DeletePurchaseSingleItemForm from "../_hiddenForm/DeletePurchaseSingleItemForm";
import PurchaseItemDataEditor from "./PurchaseItemDataEditor";

type Props = {
  purchaseItems: PurchaseItemDisplay[];
  purchaseId: string;
  totalPrice: number;
};

export default function PurchaseItemEditor({
  purchaseItems,
  purchaseId,
  totalPrice,
}: Props) {
  return (
    <div className=" flex flex-col gap-3 mx-auto max-w-md">
      {purchaseItems.map((purchaseItem) => (
        <div
          className="flex flex-row justify-between gap-2"
          key={purchaseItem.id}
        >
          <DisplaySingleItem item={purchaseItem} />
          <PurchaseItemDataEditor
            purchaseId={purchaseId}
            purchasedItem={purchaseItem}
          />
          <DeletePurchaseSingleItemForm
            purchaseId={purchaseId}
            purchaseItemId={purchaseItem.id}
          />
        </div>
      ))}
      <h3 className="p-3 w-full text-center text-xl font-mono font-black bg-gray-900">
        {formatNumberToIDR(totalPrice)}
      </h3>
    </div>
  );
}
