import { formatNumberToIDR } from "@/lib/utils/formatter";
import { PrettyQuantity } from "@/presentation/component/PrettyQuantity";
import { NumericFormat, PatternFormat } from "react-number-format";

export function DisplaySingleItem({ item }: { item: DisplaySingleItem }) {
  return (
    <div className="  font-mono w-full max-w-[500px] mx-auto flex flex-row gap-3 ">
      <PrettyQuantity number={item.quantityInHundreds} />
      <div className="text-sm uppercase w-full ">
        <div className="font-bold">{item.name}</div>
        <div className="text-xs flex flex-col gap-3">
          <p>@ {formatNumberToIDR(item.pricePerUnit)}</p>
        </div>
      </div>
      <p>
        {formatNumberToIDR(
          item.pricePerUnit * (item.quantityInHundreds / 100),
          "short"
        )}
      </p>
    </div>
  );
}
