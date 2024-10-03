import { formatNumberToIDR } from "@/lib/utils/formatter";
import { PrettyQuantity } from "@/presentation/component/PrettyQuantity";
import { NumericFormat, PatternFormat } from "react-number-format";

export function DisplaySingleItem({ item }: { item: DisplaySingleItem }) {
  return (
    <div className="font-mono w-full max-w-[500px] mx-auto flex flex-row gap-3 ">
      <div className="text-sm uppercase w-full ">
        <div className="font-bold">{item.name}</div>
        <div className="text-sm flex flex-row justify-between gap-3">
          <div className="flex flex-row">
            <PrettyQuantity number={item.quantityInHundreds} />
            <p>⨯ {formatNumberToIDR(item.pricePerUnit, "short")}</p>
          </div>
          <p>
            {formatNumberToIDR(
              item.pricePerUnit * (item.quantityInHundreds / 100),
              "short"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
