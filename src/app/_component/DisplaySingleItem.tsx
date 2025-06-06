import { formatNumberToIDR } from "@/lib/utils/formatter";
import { PrettyQuantity } from "@/presentation/component/PrettyQuantity";
import Link from "next/link";

type Props = {
  item: PurchaseItemDisplay;
  disableLink?: boolean;
};

export function DisplaySingleItem({ item, disableLink = false }: Props) {
  return (
    <div className="font-mono  flex flex-col leading-tight uppercase w-full ">
      {disableLink ? (
        <div className="font-bold">{item.name}</div>
      ) : (
        <Link
          href={`/transaction/item/detail/${item.itemId}`}
          className="font-bold hover:underline"
        >
          {item.name}
        </Link>
      )}
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
