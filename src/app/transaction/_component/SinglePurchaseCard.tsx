import {
  shortDateWithDay,
  formatNumberToIDR,
  shortDate,
} from "@/lib/utils/formatter";
import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";
import Link from "next/link";
import { MdReceiptLong } from "react-icons/md";

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
      <div className=" flex flex-row justify-center">
        {singlePurchase.imageId && (
          // TODO: Pop Up Image
          <Link
            className=" flex flex-row items-center gap-2 text-gray-500"
            href={`/api/image/${singlePurchase.imageId}.jpg`}
            target="_blank"
          >
            <MdReceiptLong />
            <span className="text-sm">Show Receipt</span>
          </Link>
        )}
      </div>
    </div>
  );
}
