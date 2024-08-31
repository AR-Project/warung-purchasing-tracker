import { isISODateStrValid, parseSearchParams } from "@/lib/utils/validator";
import DatePicker from "../_component/DatePicker";
import { groupedPurchasedItemsLoader } from "./groupItemsLoaders.action";
import ItemPicker from "../_component/ItemPicker";

type Props = {
  searchParams: SearchParams;
};
export default async function Page({ searchParams }: Props) {
  const filter = parseSearchParams(searchParams);
  const tx = await groupedPurchasedItemsLoader(filter);

  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <ItemPicker activeName={filter.keyword} />
      <DatePicker activeDateRange={filter.range} />
      <pre>{JSON.stringify(tx, null, "\t")}</pre>
    </div>
  );
}
