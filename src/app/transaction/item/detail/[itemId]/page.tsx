import React from "react";
import { itemDetailLoader } from "./_loader/itemDetail.loader";
import { BackButton } from "@/app/transaction/details/[purchaseId]/edit/_presentation/BackButton";
import { notFound } from "next/navigation";
import ItemDetailCard from "./_component/ItemDetailCard";
import PurchaseHistory from "./_component/PurchaseHistory";

type Params = { itemId: string };

type Props = {
  params: Params;
};

export default async function Page({ params }: Props) {
  const item = await itemDetailLoader(params.itemId);
  if (!item) return notFound();

  return (
    <div className="max-w-md mx-auto p-1 flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 bg-gray-900">
        <BackButton /> Kembali
      </div>

      <ItemDetailCard itemData={item.itemDetail} />
      <PurchaseHistory data={item.purchaseHistory} />
    </div>
  );
}
