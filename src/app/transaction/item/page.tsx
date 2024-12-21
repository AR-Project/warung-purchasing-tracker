import { Suspense } from "react";

import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { listOfItemsLoader } from "./_loader/listOfItem.loader";
import ListOfItem from "./_component/ListOfItem";
import TransactionNavigation from "../_component/TransactionNav";
import { dateRangeValidator, parseSearchParams } from "@/lib/utils/validator";
import DatePicker from "../_component/DatePicker";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const dateFilterParam = await searchParams;

  const dateFilter = dateRangeValidator(dateFilterParam);
  const listOfItems = await listOfItemsLoader(
    session.user.parentId,
    dateFilter
  );

  return (
    <div className="flex flex-col gap-1 max-w-md mx-auto">
      <TransactionNavigation />
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
