import Link from "next/link";
import {
  purchasedItemsByDateLoader,
  purchasedItemsLoader,
} from "./itemsLoaders.action";
import DatePicker from "./_component/DatePicker";
import { DateTime } from "luxon";
import { isISODateStrValid } from "@/lib/utils/validator";

type ItemsGroupPerMonth = {
  month: number;
  items: DisplayPerSingleItem[];
};

type SearchParams = { [key: string]: string | string[] | undefined };
// type SearchParams = { from?: string, to?: string};

type Props = {
  searchParams: SearchParams;
};

type DataRange = {
  from: string;
  to: string;
};

export default async function Page({ searchParams }: Props) {
  /** #TODO: Implement display result
   * - DONE: All items based on purchase date
   * - DONE: Items filtered by date range
   * - Group per items per months
   *    - (can select month)
   * - Group items for all transaction
   *    - Total per items depend on selected range (can select custom range)
   * - Optional: Group items per two weeks (can select week),
   */

  const dataRange = generateDataRange();

  function generateDataRange(): DataRange | undefined {
    const dateFrom = searchParams.from;
    const dateTo = searchParams.to;

    if (!isISODateStrValid(dateFrom) || !isISODateStrValid(dateTo))
      return undefined;
    return { from: dateFrom, to: dateTo };
  }

  const tx = dataRange
    ? await purchasedItemsByDateLoader(dataRange)
    : await purchasedItemsLoader();

  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <DatePicker activeDateRange={dataRange} />
      <pre>{JSON.stringify(tx, null, "\t")}</pre>
    </div>
  );
}
