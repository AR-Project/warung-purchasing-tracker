import Link from "next/link";
import { SinglePurchaseCard } from "../_component/SinglePurchaseCard";
import { transactionLoader } from "./transaction.loaders.action";
import SearchBox from "../_component/SearchBox";
import { parseSearchParams } from "@/lib/utils/validator";
import { searchVendors } from "@/lib/api";
import DatePicker from "../_component/DatePicker";

type Props = {
  searchParams: SearchParams;
};

export default async function Page({ searchParams }: Props) {
  const filter = parseSearchParams(searchParams);

  const tx = await transactionLoader(filter);

  return (
    <section className="max-w-[500px] w-full mx-auto flex flex-col gap-3 p-2">
      <SearchBox
        activeName={filter.keyword}
        searchHandler={searchVendors}
        placeholder="Cari Vendor..."
      />
      <DatePicker activeDateRange={filter.range} />
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

/** #TODO: Implement display based on these
 * - Based on month
 * - FUTURE:Based on calendar
 *    - Highlight dates that purchase happen
 *    - Pop up transaction details from that date
 */
