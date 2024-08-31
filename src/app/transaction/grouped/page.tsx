import { isISODateStrValid, parseSearchParams } from "@/lib/utils/validator";
import DatePicker from "../_component/DatePicker";
import { groupedPurchasedItemsLoader } from "./groupItemsLoaders.action";

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
  const filter = parseSearchParams(searchParams);

  const tx = await groupedPurchasedItemsLoader(filter);

  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <DatePicker activeDateRange={filter.range} />
      <pre>{JSON.stringify(tx, null, "\t")}</pre>
    </div>
  );
}
