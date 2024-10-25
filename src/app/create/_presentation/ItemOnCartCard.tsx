"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import { useRef, useState } from "react";
import { PrettyQuantity } from "@/presentation/component/PrettyQuantity";
import { MdDelete } from "react-icons/md";
import EditItemDataOnCart from "../_component/EditItemOnCartData";

type MoveItemFn = (index: number, direction: "up" | "down") => void;
type DeleteItemFn = (index: number) => void;
type OnClickFn = (itemId: string) => void;

type ItemCardProps = {
  item: CreatePurchaseItemWithName;
  index: number;
  isActive: boolean;
  onClick: OnClickFn;
  deleteItem: DeleteItemFn;
  editPurchasedItem: (
    updatedItem: CreatePurchaseItemWithName,
    index: number
  ) => void;
};

type MoveButtonProps = {
  moveItem: MoveItemFn;
  index: number;
};

type DeleteButtonProps = {
  deleteItem: DeleteItemFn;
  index: number;
};

export function ItemOnCartCard({
  item,
  index,
  isActive,
  onClick,
  deleteItem,
  editPurchasedItem,
}: ItemCardProps) {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      <button
        onClick={() => {
          onClick(item.itemId);
        }}
        className={`p-1 w-full max-w-[500px] mx-auto rounded-md ${
          isActive && "bg-gray-800 pr-2"
        }`}
      >
        {/* <MoveButtons moveItem={moveItem} index={index} /> */}
        <div className="flex flex-row gap-3">
          <PrettyQuantity number={item.quantityInHundreds} />
          <div className="flex flex-col items-start text-base uppercase w-full leading-tight">
            <div className="font-bold ">{item.name}</div>
            <div className="flex flex-row gap-3 justify-between w-full">
              <p>@ {formatNumberToIDR(item.pricePerUnit, "short")}</p>
              <p>{formatNumberToIDR(item.totalPrice, "short")}</p>
            </div>
          </div>
        </div>
      </button>
      <div
        className={` h-full  overflow-hidden transition-width ease-in-out duration-150 flex flex-row ${
          isActive ? "w-[110px]" : "w-[0px]"
        }`}
      >
        <EditItemDataOnCart
          updateItem={editPurchasedItem}
          prevPurchaseItem={item}
          itemIndex={index}
        />
        <DeleteButton deleteItem={deleteItem} index={index} />
      </div>
    </div>
  );
}

function DeleteButton({ deleteItem, index }: DeleteButtonProps) {
  return (
    <button
      className="rounded-md group h-10 aspect-square flex flex-row items-center justify-center hover:border-2 hover:border-red-700"
      onClick={() => deleteItem(index)}
    >
      <MdDelete className="text-gray-500 text-xl group-hover:text-red-500" />
    </button>
  );
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
