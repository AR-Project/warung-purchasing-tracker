import { notFound } from "next/navigation";
import { Metadata } from "next";

import { BackButton } from "@/app/_component/BackButton";
import DatePicker from "@/app/transaction/_component/DatePicker";

import { dateRangeValidator } from "@/lib/utils/validator";

import { itemDetailLoader } from "./_loader/itemDetail.loader";
import ItemDetailCard from "./_component/ItemDetailCard";
import PurchaseHistoryTable from "./_component/PurchaseHistoryTable";
import PurchaseHistoryChart from "./_component/PurchaseHistoryChart";

type Params = { itemId: string };

type Props = {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "WPT -Item Detail",
};

export default async function Page({ params, searchParams }: Props) {
  const { itemId } = await params;
  const dateFilterParam = await searchParams;

  const dateFilter = dateRangeValidator(dateFilterParam);

  const item = await itemDetailLoader(itemId, dateFilter);
  if (!item) return notFound();

  return (
    <div className="max-w-md mx-auto p-1 flex flex-col gap-2 w-full">
      <div className="flex flex-row items-center gap-2 bg-gray-900">
        <BackButton /> Kembali
      </div>

      <ItemDetailCard itemData={item.itemDetail} />
      <div className="text-center text-xl font-black p-4 border-b">
        Riwayat Pembelian
      </div>
      <DatePicker activeDateRange={dateFilter} />
      <PurchaseHistoryTable purchaseHistories={item.purchaseHistory} />
      <PurchaseHistoryChart data={item.purchaseHistory} />
    </div>
  );
}
