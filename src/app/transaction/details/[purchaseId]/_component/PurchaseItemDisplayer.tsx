import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";
import { formatNumberToIDR } from "@/lib/utils/formatter";

import DeletePurchaseSingleItemForm from "../_hiddenForm/DeletePurchaseSingleItemForm";
import PurchaseItemDataEditor from "./PurchaseItemDataEditor";

type PurchaseItem = {
  id: string;
  itemId: string;
  name: string;
  quantityInHundreds: number;
  pricePerUnit: number;
};

type Props = {
  purchaseItems: PurchaseItem[];
  purchaseId: string;
  totalPrice: number;
};

export default function PurchaseItemDisplayer({
  purchaseItems,
  purchaseId,
  totalPrice,
}: Props) {
  return (
    <div className="border border-gray-600/30 flex flex-col gap-3 mx-auto max-w-md">
      {purchaseItems.map((purchaseItem) => (
        <div className="flex flex-row justify-between" key={purchaseItem.id}>
          <DisplaySingleItem item={purchaseItem} />
          <DeletePurchaseSingleItemForm
            purchaseId={purchaseId}
            purchaseItemId={purchaseItem.id}
          />
          <PurchaseItemDataEditor
            purchaseId={purchaseId}
            purchasedItem={purchaseItem}
          />
        </div>
      ))}
      <h3 className="p-3 w-full text-center text-xl font-mono font-black bg-gray-900">
        {formatNumberToIDR(totalPrice)}
      </h3>
    </div>
  );
}
