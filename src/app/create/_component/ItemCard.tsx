"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import { useState } from "react";
import EditActivePurchasedItem from "./EditActivePurchasedItem";
import { PrettyQuantity } from "@/presentation/component/PrettyQuantity";

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
