import Link from "next/link";
import { MdReceiptLong } from "react-icons/md";

import { shortDateWithDay, formatNumberToIDR } from "@/lib/utils/formatter";
import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";

type Props = {
  singlePurchase: DisplaySinglePurchase;
};

export function SinglePurchaseCard({ singlePurchase }: Props) {
  return (
    <div className="flex flex-col">
      <Link
        href={`/transaction/details/${singlePurchase.id}`}
        className="card bg-gray-900 border border-gray-700"
      >
        <hgroup className="bg-blue-900 p-2 flex flex-row justify-between">
          <div className="flex flex-col items-baseline uppercase ">
            <time className="font-bold">
              {shortDateWithDay(singlePurchase.purchasesAt)}
            </time>
            <h2 className="text-xs">{singlePurchase.vendorName}</h2>
          </div>
          <div className="font-black font-mono">
            {formatNumberToIDR(singlePurchase.totalPrice, "short")}
          </div>
        </hgroup>
        <div className="px-2 py-1 flex flex-col gap-2">
          {singlePurchase.items.map((item) => (
            <DisplaySingleItem key={item.id} item={item} />
          ))}
        </div>
        <div className=" flex flex-row justify-center"></div>
      </Link>
      {singlePurchase.imageId && (
        <Link
          className="h-8 flex flex-row items-center gap-2 text-gray-500 w-full justify-center border-gray-700 border-r border-b border-l"
          href={`/api/image/${singlePurchase.imageId}.jpg`}
          target="_blank"
        >
          <MdReceiptLong />
          <span className="text-sm">Show Receipt</span>
        </Link>
      )}
    </div>
  );
}
