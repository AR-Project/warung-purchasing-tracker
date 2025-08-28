import { Suspense } from "react";

import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { allRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import { dateRangeValidator } from "@/lib/utils/validator";

import { listOfItemsLoader } from "./_loader/listOfItem.loader";
import ListOfItem from "./_component/ListOfItem";
import TransactionNavigation from "../_component/TransactionNav";
import DatePicker from "../_component/DatePicker";
import ExportButton from "./_component/ExportButton";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  const [user, authError] = await verifyUserAccess(allRole);
  if (authError) return <LoginRequiredWarning />;

  const dateFilterParam = await searchParams;

  const dateFilter = dateRangeValidator(dateFilterParam);
  const listOfItems = await listOfItemsLoader(user.parentId, dateFilter);

  return (
    <div className="flex flex-col gap-1 max-w-md mx-auto">
      <TransactionNavigation />
      <div className="py-3 flex flex-row justify-between border-b border-white/20">
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
