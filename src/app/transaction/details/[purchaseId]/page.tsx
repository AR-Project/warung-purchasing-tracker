import Link from "next/link";

import { PurchaseEditor } from "./_component/PurchaseEditor";
import PurchaseItemUpdater from "./_component/PurchaseItemUpdater";
import PurchaseItemDisplayer from "./_component/PurchaseItemDisplayer";
import { singlePurchaseLoader } from "./_loader/singlePurchase.loader";
import { BackButton } from "./_presentation/BackButton";

type Props = {
  params: { purchaseId: string };
};

export default async function Page({ params }: Props) {
  const details = await singlePurchaseLoader(params.purchaseId);
  if (!details) return <div>Transaction Not Found</div>;

  const { items: purchaseItems, totalPrice, id: purchaseId } = details;

  return (
    <div>
      <div className="flex flex-row gap-3 items-center mb-4">
        <BackButton />
        <div>Purchase Details</div>
      </div>
      <PurchaseEditor purchase={details} />

      <PurchaseItemDisplayer
        purchaseId={purchaseId}
        purchaseItems={purchaseItems}
        totalPrice={totalPrice}
      />
      <div className="flex flex-row gap-2">
        <PurchaseItemUpdater purchaseId={purchaseId} />
        <Link
          className="bg-blue-950 border border-gray-500 group-hover:bg-blue-800  h-8 px-2 text-gray-100 flex flex-row items-center gap-3 justify-center cursor-not-allowed"
          href="#"
        >
          Change Item Order
        </Link>
      </div>
    </div>
  );
}
