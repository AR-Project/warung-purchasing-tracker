import Link from "next/link";
import { DateTime } from "luxon";
import { isISODateStrValid } from "@/lib/utils/validator";
import DatePicker from "../_component/DatePicker";
import {
  groupedPurchasedItemsByDateLoader,
  groupedPurchasedItemsLoader,
} from "./groupItemsLoaders.action";

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
  const dataRange = generateDataRange();

  function generateDataRange(): DataRange | undefined {
    const dateFrom = searchParams.from;
    const dateTo = searchParams.to;

    if (!isISODateStrValid(dateFrom) || !isISODateStrValid(dateTo))
      return undefined;
    return { from: dateFrom, to: dateTo };
  }

  const tx = dataRange
    ? await groupedPurchasedItemsByDateLoader(dataRange)
    : await groupedPurchasedItemsLoader();

  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <DatePicker activeDateRange={dataRange} />
      <pre>{JSON.stringify(tx, null, "\t")}</pre>
    </div>
  );
}
