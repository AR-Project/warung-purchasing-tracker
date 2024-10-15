import React from "react";
import { itemDetailLoader } from "./_loader/itemDetail.loader";
import { BackButton } from "@/app/transaction/details/[purchaseId]/edit/_presentation/BackButton";

type Params = { itemId: string };

type Props = {
  params: Params;
};

export default async function Page({ params }: Props) {
  const item = await itemDetailLoader(params.itemId);
  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-row items-center gap-2 bg-gray-900">
        <BackButton /> Kembali
      </div>
      <div>TODO</div>
      <pre className="text-xs">{JSON.stringify(item, null, 4)}</pre>
    </div>
  );
}
