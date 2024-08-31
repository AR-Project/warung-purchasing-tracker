import { parseSearchParams } from "@/lib/utils/validator";

import { purchasedItemsLoader } from "./itemsLoaders.action";
import DatePicker from "../_component/DatePicker";
import ItemPicker from "../_component/ItemPicker";

type Props = {
  searchParams: SearchParams;
};

export default async function Page({ searchParams }: Props) {
  const filter = parseSearchParams(searchParams);

  const tx = await purchasedItemsLoader(filter);
  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <ItemPicker activeName={filter.keyword} />
      <DatePicker activeDateRange={filter.range} />
      <pre>{JSON.stringify(tx, null, "\t")}</pre>
    </div>
  );
}
