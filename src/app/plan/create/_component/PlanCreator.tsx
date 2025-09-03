"use client";

import { useMemo, useState } from "react";

import { CategoryWithItems } from "@/app/_loader/getUserCategoryWithItemLatestPrice";
import PlanCartDialog from "./PlanCartDialog";
import { PlanItemCard } from "./PlanItemCard";

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

  const latestItemNameAndPrice = useMemo((): Record<ItemId, ItemData> => {
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
      name: latestItemNameAndPrice[itemId].name,
      quantityInHundreds: quantity * 100,
      pricePerUnit: latestItemNameAndPrice[itemId].price,
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
      if (Object.hasOwn(prev, itemId) === false) return prev;

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
    <div className="relative flex w-full flex-col">
      <div
        data-comment="Categories Container"
        className="flex flex-col gap-3 w-full"
      >
        {availableData.map((category) => {
          const item = category.items.map((item) => (
            <PlanItemCard
              key={item.id}
              item={item}
              quantity={cart[item.id]}
              addHandler={() => addToCart(item.id)}
              removeHandler={() => reduceFromCart(item.id)}
              manualQuantity={manualQuantity}
            />
          ));

          return (
            <div
              data-comment="Single Category with Items Container"
              key={category.id}
              className="flex flex-col gap-1 w-full"
            >
              <div className="bg-gray-800 p-1 text-sm/tight">
                {category.name}
              </div>
              <div
                data-comment="Items Container"
                className="grid grid-cols-2 gap-1 w-full"
              >
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

      <div
        data-comment="Floating button container"
        className="fixed bottom-5 right-5 z-20 "
      >
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
