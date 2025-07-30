"use client";

import { clsx } from "clsx";
import { useMemo, useRef, useState } from "react";
import { TbShoppingCartMinus } from "react-icons/tb";
import { NumericFormat } from "react-number-format";

import {
  CategoryWithItems,
  ItemWithPrice,
} from "@/app/_loader/getUserCategoryWithItemLatestPrice";
import { formatNumberToIDR } from "@/lib/utils/formatter";
import PlanCartDialog from "./PlanCartDialog";

type Props = {
  availableData: CategoryWithItems[];
};

type Quantity = number;
type ItemId = string;

type ItemData = {
  price: number;
  name: string;
};

export default function PlanCreator({ availableData }: Props) {
  const [cart, setCart] = useState<Record<ItemId, Quantity>>({});

  const list = useMemo((): Record<ItemId, ItemData> => {
    const list: Record<ItemId, ItemData> = {};
    availableData.forEach((ctg) => {
      ctg.items.forEach((item) => {
        list[item.id] = {
          name: item.name,
          price: item.lastPrice,
        };
      });
    });
    return list;
  }, [availableData]);

  const displayer: PurchaseItemDisplay[] = [];

  for (const [itemId, quantity] of Object.entries(cart)) {
    displayer.push({
      id: `planner-${itemId}`,
      itemId: itemId,
      name: list[itemId].name,
      quantityInHundreds: quantity * 100,
      pricePerUnit: list[itemId].price,
    });
  }

  function addToCart(itemId: string) {
    setCart((prev) => {
      if (prev[itemId] === undefined) {
        return {
          ...prev,
          [itemId]: 1,
        };
      }
      return { ...prev, [itemId]: prev[itemId] + 1 };
    });
  }

  function reduceFromCart(itemId: string) {
    setCart((prev) => {
      if (prev[itemId] === 1 || prev[itemId] - 1 < 0) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      return { ...prev, [itemId]: prev[itemId] - 1 };
    });
  }

  function manualQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      reduceFromCart(itemId);
      return;
    }
    setCart((prev) => ({ ...prev, [itemId]: quantity }));
  }

  function clearCart() {
    setCart({});
  }

  return (
    <div className="relative">
      <div className="flex flex-col gap-3">
        {availableData.map((ctg) => {
          const item = ctg.items.map((item) => (
            <ItemButton
              key={item.id}
              item={item}
              quantity={cart[item.id]}
              clickHandler={() => addToCart(item.id)}
              removeHandler={() => reduceFromCart(item.id)}
              manualQuantity={manualQuantity}
            />
          ));

          return (
            <div key={ctg.id} className="flex flex-col gap-1">
              <div className="bg-gray-800 p-1  text-sm/tight">{ctg.name}</div>
              <div className="grid grid-cols-4 gap-1">
                {item.length === 0 ? (
                  <div className="italic text-white/50">Item kosong</div>
                ) : (
                  <>{item}</>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <pre className="text-[0.6rem]/3 text-gray-50 ">
        {JSON.stringify(cart, null, 2)}
      </pre>
      {/* Floating button container */}
      <div className="fixed bottom-5 right-5 ">
        <PlanCartDialog
          totalPrice={displayer.reduce(
            (bag, current) =>
              (current.pricePerUnit * current.quantityInHundreds) / 100 + bag,
            0
          )}
          purchaseItems={displayer}
        />
      </div>
    </div>
  );
}

type AddItemButtonProps = {
  item: ItemWithPrice;
  clickHandler: () => void;
  removeHandler: () => void;
  quantity: number;
  manualQuantity: (itemId: string, quantity: number) => void;
};
function ItemButton({
  item,
  clickHandler,
  removeHandler,
  quantity,
  manualQuantity,
}: AddItemButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col aspect-square rounded-sm">
      {quantity && (
        <NumericFormat
          className="bg-gray-800 border border-gray-500 p-1 rounded-sm w-full text-center font-black text-lg "
          value={quantity}
          getInputRef={inputRef}
          thousandSeparator=" "
          decimalSeparator=","
          decimalScale={2}
          placeholder="Jumlah"
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
      )}
      <button
        onClick={clickHandler}
        className={clsx(
          quantity > 0 ? "bg-lime-700" : "bg-gray-600",
          "text-xs grow p-2 font-mono uppercase"
        )}
      >
        <div className="font-light text-balance">{item.name}</div>
        <div className="">{formatNumberToIDR(item.lastPrice, "short")}</div>
      </button>
      {quantity && (
        <button
          onClick={removeHandler}
          className="flex justify-center items-center h-8 border border-red-700 m-1"
        >
          <TbShoppingCartMinus />
        </button>
      )}
    </div>
  );
}
