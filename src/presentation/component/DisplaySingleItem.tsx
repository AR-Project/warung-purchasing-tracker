import { formatNumberToIDR } from "@/lib/utils/formatter";
import { PrettyQuantity } from "@/presentation/component/PrettyQuantity";

export function DisplaySingleItem({ item }: { item: DisplaySingleItem }) {
  return (
    <div className="font-mono max-w-[350px] mx-auto flex flex-col leading-tight uppercase w-full ">
      <div className="font-bold">{item.name}</div>
      <div className=" flex flex-row justify-between gap-3">
        <div className="opacity-60 flex flex-row">
          <PrettyQuantity number={item.quantityInHundreds} />
          <p>⨯ {formatNumberToIDR(item.pricePerUnit, "short")}</p>
        </div>
        <div className="font-bold">
          {formatNumberToIDR(
            item.pricePerUnit * (item.quantityInHundreds / 100),
            "short"
          )}
        </div>
      </div>
    </div>
  );
}
