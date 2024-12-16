"use client";

import { ItemWithPrice } from "@/app/_loader/getUserItemsWithLatestPrice";
import useList from "@/presentation/hooks/useList";
import { float } from "drizzle-orm/mysql-core";
import { useMemo, useRef, useState } from "react";
import { GrPowerReset } from "react-icons/gr";
import { TbShoppingCartMinus } from "react-icons/tb";
import { NumericFormat } from "react-number-format";
import { clsx } from "clsx";
import { formatNumberToIDR } from "@/lib/utils/formatter";
import { MdShoppingCart } from "react-icons/md";
import PlanCartDialog from "./PlanCartDialog";

type Props = {
  initialItems: ItemWithPrice[];
};

type Quantity = number;
type ItemId = string;
type Price = number;

export default function PlanCreator({ initialItems }: Props) {
  const [cart, setCart] = useState<Record<ItemId, Quantity>>({});

  const [itemsLastPrice, itemsName] = useMemo((): [
    Record<ItemId, Price>,
    Record<ItemId, string>
  ] => {
    const lastPrice: Record<ItemId, Price> = {};
    const name: Record<ItemId, string> = {};
    initialItems.forEach((item) => {
      console.log("initial" + new Date().toISOString());

      lastPrice[item.id] = item.lastPrice;
      name[item.id] = item.name;
    });
    return [lastPrice, name];
  }, [initialItems]);

  // Should run everytime cart state changes
  const arrayOfItemPrice: number[] = [];
  const displayer: PurchaseItemDisplay[] = [];
  for (const [itemId, quantity] of Object.entries(cart)) {
    arrayOfItemPrice.push(quantity * itemsLastPrice[itemId]);
    displayer.push({
      id: "planner",
      itemId: itemId,
      name: itemsName[itemId],
      quantityInHundreds: quantity * 100,
      pricePerUnit: itemsLastPrice[itemId],
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

  function removeFromCart(itemId: string) {
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
    if (quantity == 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) => ({ ...prev, [itemId]: quantity }));
  }

  function clearCart() {
    setCart({});
  }

  return (
    <div className="relative">
      {/* <pre className="text-xs">{JSON.stringify(displayer, null, 2)}</pre> */}
      {/* <button
        onClick={clearCart}
        className="bg-red-500 h-10 aspect-square flex justify-center items-center text-2xl"
      >
        <GrPowerReset />
      </button> */}
      <div className="grid grid-cols-3 gap-1">
        {initialItems.map((item) => (
          <AddItemButton
            key={item.id}
            item={item}
            quantity={cart[item.id]}
            clickHandler={() => addToCart(item.id)}
            removeHandler={() => removeFromCart(item.id)}
            manualQuantity={manualQuantity}
          />
        ))}
      </div>
      <pre className="text-[0.6rem]/3 text-gray-50 ">
        {JSON.stringify(cart, null, 2)}
      </pre>
      <div className="fixed bottom-5 right-5 ">
        <PlanCartDialog
          totalPrice={arrayOfItemPrice.reduce(
            (bag, current) => current + bag,
            0
          )}
          purchaseItems={displayer}
        />
        {/*         
        <div>
          {formatNumberToIDR(
            arrayOfItemPrice.reduce((bag, current) => current + bag, 0)
          )}
        </div>
        <MdShoppingCart /> */}
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
function AddItemButton({
  item,
  clickHandler,
  removeHandler,
  quantity,
  manualQuantity,
}: AddItemButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col aspect-square">
      {quantity && (
        <NumericFormat
          className="bg-gray-800 border border-gray-500 p-1 rounded-sm w-full text-center font-black text-lg "
          value={quantity}
          getInputRef={inputRef}
          thousandSeparator=" "
          decimalSeparator=","
          decimalScale={2}
          placeholder="Jumlah"
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
