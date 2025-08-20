import { notFound } from "next/navigation";

import { BackButton } from "@/app/_component/BackButton";
import { itemDetailLoader } from "./_loader/itemDetail.loader";
import ItemDetailCard from "./_component/ItemDetailCard";
import PurchaseHistory from "./_component/PurchaseHistory";

type Params = { itemId: string };

type Props = {
  params: Promise<Params>;
};

export default async function Page({ params }: Props) {
  const { itemId } = await params;
  const item = await itemDetailLoader(itemId);
  if (!item) return notFound();

  return (
    <div className="max-w-md mx-auto p-1 flex flex-col gap-2 w-full">
      <div className="flex flex-row items-center gap-2 bg-gray-900">
        <BackButton /> Kembali
      </div>

      <ItemDetailCard itemData={item.itemDetail} />
      <div className="text-center text-xl font-black p-4 border-b">
        Laporan item
      </div>
      <PurchaseHistory data={item.purchaseHistory} />
    </div>
  );
}
