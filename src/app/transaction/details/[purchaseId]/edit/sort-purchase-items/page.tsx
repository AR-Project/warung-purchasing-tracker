import { Metadata } from "next";

import { BackButton } from "@/app/_component/BackButton";

import PurchaseItemOrderEditor from "./_component/PurchaseItemOrderEditor";
import { sortPurchaseItemsLoader } from "./_loader/sortPurchaseItems.loader";
import { pageAuthAccess } from "@/lib/utils/auth";
import { adminManagerRole } from "@/lib/const";

type Props = {
  params: Promise<{ purchaseId: string }>;
};

export const metadata: Metadata = {
  title: "WPT - Purchase Order Editor",
};

export default async function Page({ params }: Props) {
  await pageAuthAccess(adminManagerRole)
  const { purchaseId } = await params;

  const listOfPurchaseItem: PurchaseItemDisplay[] =
    await sortPurchaseItemsLoader(purchaseId);
  return (
    <div className="max-w-md mx-auto flex flex-col gap-4">
      <div className="w-full flex flex-row gap-2 justify-start items-center">
        <BackButton /> Kembali
      </div>
      <div className="text-lg text-center font-bold">Urutkan Item</div>
      <PurchaseItemOrderEditor
        listOfPurchaseItem={listOfPurchaseItem}
        purchaseId={purchaseId}
      />
    </div>
  );
}
