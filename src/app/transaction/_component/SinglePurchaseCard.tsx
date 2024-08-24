import {
  shortDateWithDay,
  formatNumberToIDR,
  shortDate,
} from "@/lib/utils/formatter";
import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";

type Props = {
  singlePurchase: DisplaySinglePurchase;
};

export function SinglePurchaseCard({ singlePurchase }: Props) {
  return (
    <div className="card bg-gray-900 border border-gray-700 mb-4">
      <hgroup className="bg-blue-900 p-2 flex flex-row justify-between">
        <div className="flex flex-col items-baseline uppercase ">
          <h2 className="font-bold">{singlePurchase.vendorName}</h2>
          <time className="text-xs">
            {shortDateWithDay(singlePurchase.purchasesAt)}
          </time>
        </div>
        <div className="font-black font-mono">
          {formatNumberToIDR(singlePurchase.totalPrice)}
        </div>
      </hgroup>
      <div className="px-2 py-1 flex flex-col gap-2">
        {singlePurchase.items.map((item) => (
          <DisplaySingleItem key={item.id} item={item} />
        ))}
      </div>
      <div className="text-xs italic uppercase px-2 py-1 text-gray-500 text-right">
        {shortDate(singlePurchase.createdAt)}
      </div>
    </div>
  );
}
