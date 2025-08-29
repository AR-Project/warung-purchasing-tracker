"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ImSpinner5 } from "react-icons/im";

type DataTemplate = { id: string; name: string };

type Props = {
  initialVendors: DataTemplate[];
  initialItems: DataTemplate[];
};

const PurchaseCreator = dynamic(() => import("./_component/PurchaseCreator"), {
  ssr: false,
});

export default function PurchaseCreatorClient(props: Props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PurchaseCreator {...props} />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className=" h-[90vh] flex flex-col items-center justify-center animate-pulse bg-gray-900">
      <ImSpinner5 className="animate-spin text-3xl/tight mb-4" />
      <div>Memuat...</div>
    </div>
  );
}
