import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";
import { formatNumberToIDR } from "@/lib/utils/formatter";

type PurchaseItem = {
  id: string;
  itemId: string;
  name: string;
  quantityInHundreds: number;
  pricePerUnit: number;
};

type Props = {
  purchaseItems: PurchaseItem[];
  totalPrice: number;
};

export default function PurchaseItemDisplayer({
  purchaseItems,
  totalPrice,
}: Props) {
  return (
    <div className="border w-full border-gray-600/30 flex flex-col  mx-auto max-w-md ">
      {purchaseItems.map((purchaseItem) => (
        <div
          className="flex flex-row justify-between odd:bg-gray-800 even:bg-gray-900 px-3 py-1"
          key={purchaseItem.id}
        >
          <DisplaySingleItem item={purchaseItem} />
        </div>
      ))}
      <h3 className="p-3 w-full text-right text-xl font-mono font-black bg-gray-700">
        {formatNumberToIDR(totalPrice)}
      </h3>
    </div>
  );
}
