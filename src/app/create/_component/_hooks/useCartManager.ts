import { useState } from "react";
import { toast } from "react-toastify";

export default function useCartManager() {
  const [itemsCart, setItemsCart] = useState<CreatePurchaseItemWithName[]>([]);
  const [activeItemOnCart, setActiveItemOnCart] = useState<string>("");

  const cartTotalPrice = itemsCart.reduce(
    (accumulator, item) => accumulator + item.totalPrice,
    0
  );

  function appendItemToCart(item: CreatePurchaseItemWithName) {
    const isAlreadyAdded =
      itemsCart.filter((addedItem) => addedItem.itemId == item.itemId).length >
      0;

    if (isAlreadyAdded) return "Tambahkan item lain";
    setItemsCart((prevItems) => [...prevItems, item]);
  }

  function updateItemOnCart(
    updatedItem: CreatePurchaseItemWithName,
    index: number
  ) {
    setItemsCart((prevItemsList) => {
      const newList = [...prevItemsList];
      newList[index] = updatedItem;
      return newList;
    });
    setActiveItemOnCart("");
  }

  function deleteItemOnCart(itemIndex: number) {
    toast.info(`Item ${itemsCart[itemIndex].name} deleted`);
    setItemsCart((prevItems) =>
      [...prevItems].filter((_, index) => index != itemIndex)
    );
  }

  function itemOnCartClickHandler(itemId: string) {
    setActiveItemOnCart((prev) => {
      return prev == itemId ? "" : itemId;
    });
  }

  function resetCart() {
    setItemsCart([]);
  }

  return {
    itemsCart,
    activeItemOnCart,
    cartTotalPrice,
    appendItemToCart,
    updateItemOnCart,
    deleteItemOnCart,
    resetCart,
    itemOnCartClickHandler,
  };
}
