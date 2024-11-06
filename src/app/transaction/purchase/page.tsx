import { Suspense } from "react";

import { parseSearchParams } from "@/lib/utils/validator";
import { searchVendors } from "@/lib/api";

import { SinglePurchaseCard } from "../_component/SinglePurchaseCard";
import SearchBox from "../_component/SearchBox";
import DatePicker from "../_component/DatePicker";
import { transactionLoader } from "./listOfPurchase.loader";
import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import TransactionNavigation from "../_component/TransactionNav";

type Props = {
  searchParams: SearchParams;
};

export default async function Page({ searchParams }: Props) {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const filter = parseSearchParams(searchParams);

  const tx = await transactionLoader(filter, session.user.parentId);

  return (
    <section className="max-w-[500px] w-full mx-auto flex flex-col gap-3 p-2">
      <TransactionNavigation />
      <Suspense>
        <SearchBox
          activeName={filter.keyword}
          searchHandler={searchVendors}
          placeholder="Cari Vendor..."
        />
      </Suspense>
      <Suspense>
        <DatePicker activeDateRange={filter.range} />
      </Suspense>
      <div className="grid grid-cols-2 gap-3">
        {tx.map((singlePurchase) => (
          <SinglePurchaseCard
            singlePurchase={singlePurchase}
            key={singlePurchase.id}
          />
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
