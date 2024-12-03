import { BackButton } from "@/app/_component/BackButton";

import PurchaseItemOrderEditor from "./_component/PurchaseItemOrderEditor";
import { sortPurchaseItemsLoader } from "./_loader/sortPurchaseItems.loader";

type Props = {
  params: { purchaseId: string };
};

export default async function Page({ params }: Props) {
  const listOfPurchaseItem: PurchaseItemDisplay[] =
    await sortPurchaseItemsLoader(params.purchaseId);
  return (
    <div className="max-w-md mx-auto flex flex-col gap-4">
      <div className="w-full flex flex-row gap-2 justify-start items-center">
        <BackButton /> Kembali
      </div>
      <div className="text-lg text-center font-bold">Urutkan Item</div>
      <PurchaseItemOrderEditor
        listOfPurchaseItem={listOfPurchaseItem}
        purchaseId={params.purchaseId}
      />
    </div>
  );
}
