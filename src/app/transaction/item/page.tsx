import { Suspense } from "react";
import { Metadata } from "next";


import { adminManagerRole } from "@/lib/const";
import { pageAuthAccess } from "@/lib/utils/auth";
import { dateRangeValidator } from "@/lib/utils/validator";

import { listOfItemsLoader } from "./_loader/listOfItem.loader";
import ListOfItem from "./_component/ListOfItem";
import TransactionNavigation from "../_component/TransactionNav";
import DatePicker from "../_component/DatePicker";
import ExportButton from "./_component/ExportButton";

type Props = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "WPT - Item List",
};

export default async function Page({ searchParams }: Props) {
  const user = await pageAuthAccess(adminManagerRole)

  const dateFilterParam = await searchParams;

  const dateFilter = dateRangeValidator(dateFilterParam);
  const listOfItems = await listOfItemsLoader(user.parentId, dateFilter);

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <TransactionNavigation />
      <div className="py-2 flex flex-row justify-between border-b border-white/20 bg-gradient-to-t from-blue-900/50 to-black mb-2">
        <div className="text-xl">Daftar Pembelian per Item</div>
        <ExportButton range={dateFilter} />
      </div>
      <div>
        <DatePicker activeDateRange={dateFilter} />
      </div>
      <Suspense>
        <ListOfItem
          key={`${dateFilter?.from}${dateFilter?.to}`}
          items={listOfItems}
        />
      </Suspense>
    </div>
  );
}

export const dynamic = "force-dynamic";
