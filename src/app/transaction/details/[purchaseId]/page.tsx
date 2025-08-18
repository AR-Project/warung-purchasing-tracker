import Link from "next/link";
import { notFound } from "next/navigation";

import { stringToDate } from "@/lib/utils/formatter";

import PurchaseItemDisplayer from "@/app/_component/PurchaseItemDisplayer";
import { BackButton } from "@/app/_component/BackButton";

import { singlePurchaseLoader } from "./_loader/singlePurchase.loader";
import { verifyUserAccess } from "@/lib/utils/auth";

type Props = {
  params: Promise<{ purchaseId: string }>;
};

export default async function Page({ params }: Props) {
  const { purchaseId: purchaseIdParam } = await params;
  const details = await singlePurchaseLoader(purchaseIdParam);
  if (!details) {
    return notFound();
  }
  const { items: purchaseItems, totalPrice, id: purchaseId } = details;

  const [user, _] = await verifyUserAccess(["admin", "manager", "staff"]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-3 items-center mb-4 max-w-md mx-auto w-full">
        <BackButton />
        <div>Purchase Details</div>
      </div>

      <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
        <div>
          <div className="flex flex-row justify-between items-baseline w-full">
            <div className="text-lg font-bold">
              {stringToDate(details.purchasedAt)}
            </div>
            <div className="italic text-gray-400">{details.vendorName}</div>
          </div>
        </div>
      </div>

      <PurchaseItemDisplayer
        purchaseItems={purchaseItems}
        totalPrice={totalPrice}
      />
      {user && (
        <div className="flex flex-row gap-2 max-w-md mx-auto w-full">
          <Link
            className="bg-blue-950 border border-gray-500 group-hover:bg-blue-800  h-8 px-2 text-gray-100 flex flex-row items-center gap-3 justify-center "
            href={`./${purchaseId}/edit`}
          >
            Edit Purchase Details
          </Link>
        </div>
      )}

      {details.imageUrl && (
        <div className="flex flex-row gap-2 max-w-md mx-auto w-full">
          <DisplayImage url={details.imageUrl} />
        </div>
      )}
    </div>
  );
}

type DisplayImageProps = {
  url: string;
};

function DisplayImage({ url }: DisplayImageProps) {
  return (
    <div className="max-w-[100px] object-contain">
      <Link href={`/api/image/${url}`}>
        <img src={`/api/image/${url}`} alt="" />
      </Link>
    </div>
  );
}
