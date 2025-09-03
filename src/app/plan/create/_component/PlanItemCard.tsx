"use client";
import clsx from "clsx";
import { useRef } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { NumericFormat } from "react-number-format";

import { ItemWithPrice } from "@/app/_loader/getUserCategoryWithItemLatestPrice";
import { formatNumberToIDR } from "@/lib/utils/formatter";

type PlanItemCardProps = {
  item: ItemWithPrice;
  addHandler: () => void;
  removeHandler: () => void;
  quantity: number;
  manualQuantity: (itemId: string, quantity: number) => void;
};

export function PlanItemCard({
  item,
  addHandler,
  removeHandler,
  quantity,
  manualQuantity,
}: PlanItemCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isQuantityExist = !!quantity;

  return (
    <div
      className={`relative flex flex-col rounded-sm w-full border border-white/10 justify-between p-1 gap-1 ${
        isQuantityExist ? "bg-green-600/50" : "bg-gray-900"
      }`}
    >
      {item.imageUrl && (
        <div className="">
          <img
            src={`/api/image/${item.imageUrl}`}
            alt=""
            className="absolute top-0 left-0 h-full opacity-50 brightness-70 mask-r-from-30%"
          />
        </div>
      )}
      <div className="text-center text-balance text-sm">{item.name}</div>
      <div className="flex flex-row gap-2 items-end z-10">
        <button
          data-comment="Remove Button"
          disabled={!isQuantityExist}
          onClick={removeHandler}
          className={clsx(
            isQuantityExist ? "" : "opacity-0",
            "flex justify-center items-center p-1 border border-gray-600 bg-gray-700 cursor-pointer w-14 aspect-square disabled:cursor-auto"
          )}
        >
          <FaMinus />
        </button>
        <div
          data-comment="Item Information Container"
          className="flex flex-col justify-between text-center"
        >
          <div>
            <div className="text-sm font-mono">
              {formatNumberToIDR(item.lastPrice, "short")}
            </div>
          </div>
          <div>
            <NumericFormat
              className={clsx(
                isQuantityExist ? "" : "opacity-0",
                "bg-gray-800 border border-gray-500 rounded-sm text-center font-black h-full w-full disabled:cursor-default"
              )}
              disabled={!isQuantityExist}
              value={isQuantityExist ? quantity : ""}
              getInputRef={inputRef}
              thousandSeparator=" "
              decimalSeparator=","
              decimalScale={2}
              min={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  inputRef.current?.blur();
                }
              }}
              onValueChange={(values) => {
                const quantity = values.floatValue ? values.floatValue : 0;
                manualQuantity(item.id, quantity);
              }}
            />
          </div>
        </div>

        <button
          data-comment="Add Button"
          onClick={addHandler}
          className={clsx(
            quantity > 0 ? "border-lime-700" : "border-gray-600",
            " uppercase relative border bg-blue-800 p-1 w-14 aspect-square flex items-center justify-center cursor-pointer"
          )}
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
}
