"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import { useState } from "react";
import EditActivePurchasedItem from "./EditActivePurchasedItem";

type MoveItemFn = (index: number, direction: "up" | "down") => void;
type DeleteItemFn = (index: number) => void;

type ItemCardProps = {
  item: PurchasedItem;
  index: number;
  moveItem: MoveItemFn;
  deleteItem: DeleteItemFn;
  editPurchasedItem: (updatedItem: PurchasedItem, index: number) => void;
};

type MoveButtonProps = {
  moveItem: MoveItemFn;
  index: number;
};

type DeleteButtonProps = {
  deleteItem: DeleteItemFn;
  index: number;
};

export function ItemCard({
  item,
  index,
  moveItem,
  deleteItem,
  editPurchasedItem,
}: ItemCardProps) {
  const [hover, setHover] = useState<boolean>(false);

  const hundredsToString = (number: number) => {
    if (number % 100 === 0) return (number / 100).toString();
    return (number / 100).toFixed(2);
  };

  const PrettyQuantity = ({ number }: { number: number }) => {
    const quantity = hundredsToString(item.quantityInHundreds).split(".");
    return (
      <div className="flex flex-row items-baseline min-w-10">
        <div className=" font-black text-xl">{quantity[0]}</div>
        {quantity.length > 1 && (
          <div className=" text-xs text-white/40">,{quantity[1]}</div>
        )}
      </div>
    );
  };

  return (
    <div className=" w-full max-w-[500px] mx-auto flex flex-row gap-3 ">
      {/* <MoveButtons moveItem={moveItem} index={index} /> */}
      <PrettyQuantity number={item.quantityInHundreds} />
      <div className="text-sm uppercase w-full">
        <div className="font-bold">{item.name}</div>
        <div className="text-xs flex flex-row gap-3">
          <p>@ {formatNumberToIDR(item.pricePerUnit)}</p>
        </div>
      </div>
      <p>{formatNumberToIDR(item.totalPrice)}</p>
      <EditActivePurchasedItem
        editPurchasedItem={editPurchasedItem}
        purchasedItem={item}
        itemIndex={index}
      />
      <DeleteButton deleteItem={deleteItem} index={index} />
    </div>
  );
}

function DeleteButton({ deleteItem, index }: DeleteButtonProps) {
  return <button onClick={() => deleteItem(index)}>❌</button>;
}

function MoveButtons({ moveItem, index }: MoveButtonProps) {
  return (
    <div className="flex flex-row text-xl">
      <button className="hover:scale-125" onClick={() => moveItem(index, "up")}>
        🔼
      </button>
      <button
        className="hover:scale-125"
        onClick={() => moveItem(index, "down")}
      >
        🔽
      </button>
    </div>
  );
}