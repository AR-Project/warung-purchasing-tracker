import Link from "next/link";
import { MdReceiptLong } from "react-icons/md";

import { shortDateWithDay, formatNumberToIDR } from "@/lib/utils/formatter";
import { DisplaySingleItem } from "@/app/_component/DisplaySingleItem";

type Props = {
  singlePurchase: PurchaseDisplay;
};

export function SinglePurchaseCard({ singlePurchase }: Props) {
  return (
    <div className="group flex flex-col">
      <Link
        href={`/transaction/details/${singlePurchase.id}`}
        className="group relative card bg-gray-900 border border-gray-700"
      >
        <div className="CARD-OVERLAY transition-colors ease-in-out duration-150 group-hover:bg-white/10 bg-white/0 absolute w-full h-full top-0 left-0  z-50"></div>

        <hgroup className="bg-blue-900 p-2 flex flex-row justify-between">
          <div className="flex flex-col items-baseline uppercase ">
            <time className="font-bold">
              {shortDateWithDay(singlePurchase.purchasesAt)}
            </time>
            <h2 className="text-xs">{singlePurchase.vendorName}</h2>
          </div>
        </hgroup>
        <div className="px-2 py-1 flex flex-col gap-2 text-gray-300 text-xs">
          {singlePurchase.items.map((item) => (
            <DisplaySingleItem key={item.id} item={item} disableLink={true} />
          ))}
        </div>
        <div className="font-black font-mono w-full flex flex-row justify-end px-2 bg-gray-800 py-1">
          {formatNumberToIDR(singlePurchase.totalPrice)}
        </div>
      </Link>
      {singlePurchase.imageId && (
        <Link
          className="h-8 flex flex-row items-center gap-2 text-gray-500 w-full justify-center border-gray-700 border-r border-b border-l"
          href={`/api/image/${singlePurchase.imageId}`}
          target="_blank"
        >
          <MdReceiptLong />
          <span className="text-sm">Show Receipt</span>
        </Link>
      )}
    </div>
  );
}
