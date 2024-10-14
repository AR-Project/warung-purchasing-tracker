import Link from "next/link";
import { notFound } from "next/navigation";

import PurchaseDeleteDialog from "../_component/PurchaseDeleteDialog";
import PurchaseItemUpdater from "../_component/PurchaseItemUpdater";
import { singlePurchaseLoader } from "../_loader/singlePurchase.loader";
import { BackButton } from "./_presentation/BackButton";
import { PurchaseDataEditor } from "./_component/PurchaseDataEditor";
import PurchaseItemEditor from "./_component/PurchaseItemEditor";

type Props = {
  params: { purchaseId: string };
};

export default async function Page({ params }: Props) {
  const details = await singlePurchaseLoader(params.purchaseId);
  if (!details) {
    notFound();
  }

  const { items: purchaseItems, totalPrice, id: purchaseId } = details;

  return (
    <div className="flex flex-col w-full max-w-md m-auto">
      <div className="flex flex-row  items-center justify-between mb-4">
        <div className="flex flex-row  items-center gap-3">
          <BackButton />
          <div>Purchase Editor</div>
        </div>
        <PurchaseDeleteDialog purchaseId={purchaseId} />
      </div>

      <PurchaseDataEditor purchase={details} />

      <div className="flex flex-row gap-2 m-auto">
        <Link
          className="bg-blue-950 border border-gray-500 group-hover:bg-blue-800  h-8 px-2 text-gray-100 flex flex-row items-center gap-3 justify-center cursor-not-allowed"
          href="#"
        >
          Change Item Order
        </Link>
      </div>

      <div className="w-full">
        <PurchaseItemEditor
          purchaseId={purchaseId}
          purchaseItems={purchaseItems}
          totalPrice={totalPrice}
        />
      </div>

      <PurchaseItemUpdater purchaseId={purchaseId} />
    </div>
  );
}
