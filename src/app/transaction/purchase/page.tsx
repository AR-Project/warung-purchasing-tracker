import { Suspense } from "react";

import { parseSearchParams } from "@/lib/utils/validator";
import { searchVendors } from "@/lib/api";

import { SinglePurchaseCard } from "../_component/SinglePurchaseCard";
import SearchBox from "../_component/SearchBox";
import DatePicker from "../_component/DatePicker";

import { transactionLoader } from "./transaction.loaders.action";

type Props = {
  searchParams: SearchParams;
};

export default async function Page({ searchParams }: Props) {
  const filter = parseSearchParams(searchParams);

  const tx = await transactionLoader(filter);

  return (
    <section className="max-w-[500px] w-full mx-auto flex flex-col gap-3 p-2">
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
