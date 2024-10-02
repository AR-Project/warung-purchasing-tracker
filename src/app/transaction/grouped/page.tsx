import { parseSearchParams } from "@/lib/utils/validator";
import DatePicker from "../_component/DatePicker";
import { groupedPurchasedItemsLoader } from "./groupItemsLoaders.action";
import SearchBox from "../_component/SearchBox";
import { searchItems } from "@/lib/api";
import { FaAngleDown } from "react-icons/fa";

type Props = {
  searchParams: SearchParams;
};
export default async function Page({ searchParams }: Props) {
  const filter = parseSearchParams(searchParams);
  const tx = await groupedPurchasedItemsLoader(filter);

  // FUTURE: Display history price and quantity per purchase
  return (
    <div className="flex flex-col p-2 w-full max-w-[550px] mx-auto">
      <SearchBox activeName={filter.keyword} searchHandler={searchItems} />
      <DatePicker activeDateRange={filter.range} />
      <div className="flex flex-col py-5">
        {tx.map((item) => (
          <button
            key={item.id}
            className="flex flex-row h-10 items-center justify-between hover:bg-gray-700"
          >
            <div className="flex flex-row gap-2">
              <Quantity quantity={item.totalQuantityInHundred / 100} />
              <h1 className="">{item.name}</h1>
            </div>
            <FaAngleDown />
          </button>
        ))}
      </div>
    </div>
  );
}

function Quantity({ quantity }: { quantity: number }) {
  const splitQuantity = quantity.toString().split(".");

  return (
    <div className="w-16 grid grid-cols-2 ">
      <div className="text-right font-bold">{splitQuantity[0]}</div>
      <div>{splitQuantity[1] ? `,${splitQuantity[1]}` : ""}</div>
    </div>
  );
}
