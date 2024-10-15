import Link from "next/link";
import { notFound } from "next/navigation";

import PurchaseDeleteDialog from "../_component/PurchaseDeleteDialog";
import PurchaseItemUpdater from "../_component/PurchaseItemUpdater";
import { singlePurchaseLoader } from "../_loader/singlePurchase.loader";
import { BackButton } from "./_presentation/BackButton";
import { PurchaseDataEditor } from "./_component/PurchaseDataEditor";
import PurchaseItemEditor from "./_component/PurchaseItemEditor";
import { CgReorder } from "react-icons/cg";

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
    <div className="flex flex-col w-full max-w-md m-auto gap-2">
      <div className="flex flex-row  items-center justify-between mb-4">
        <div className="flex flex-row  items-center gap-3">
          <BackButton />
          <div>Purchase Editor</div>
        </div>
        <PurchaseDeleteDialog purchaseId={purchaseId} />
      </div>

      <PurchaseDataEditor purchase={details} />
      <div className="_SEPARATOR w-full border-b border-white/20"></div>

      <div className="flex flex-row gap-2 m-auto justify-end w-full">
        <Link
          className=" border border-gray-500/10 bg-blue-800  h-10 px-2 text-gray-100 flex flex-row items-center gap-3 justify-center"
          href="./edit/sort-purchase-items"
        >
          <CgReorder className="text-2xl" /> Reorder Items
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
      <div className="_SEPARATOR w-full border-b border-white/20"></div>
      {/* TODO: Image editor */}
    </div>
  );
}
