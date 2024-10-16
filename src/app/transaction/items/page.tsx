import { parseSearchParams } from "@/lib/utils/validator";

import { purchasedItemsLoader } from "./itemsLoaders.action";
import DatePicker from "../_component/DatePicker";
import SearchBox from "../_component/SearchBox";
import { searchItems } from "@/lib/api";
import { Suspense } from "react";

type Props = {
  searchParams: SearchParams;
};

/**
 * @deprecated
 */
export default async function Page({ searchParams }: Props) {
  const filter = parseSearchParams(searchParams);

  const tx = await purchasedItemsLoader(filter);
  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <Suspense>
        <SearchBox activeName={filter.keyword} searchHandler={searchItems} />
      </Suspense>
      <Suspense>
        <DatePicker activeDateRange={filter.range} />
      </Suspense>
      <pre>{JSON.stringify(tx, null, "\t")}</pre>
    </div>
  );
}

export const dynamic = "force-dynamic";
