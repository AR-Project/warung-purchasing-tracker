import { useState } from "react";

import { useLocalStorage } from "usehooks-ts";

export default function useCartManager(listOfItemId?: string[]) {
  const listOfItemIdOnExternal = listOfItemId ? listOfItemId : [];
  const [itemsCart, setItemsCart] = useLocalStorage<
    CreatePurchaseItemWithName[]
  >("user-cart", []);
  const [activeItemOnCart, setActiveItemOnCart] = useState<string>("");

  const cartTotalPrice = itemsCart.reduce(
    (accumulator, item) => accumulator + item.totalPrice,
    0
  );

  function appendItemToCart(item: CreatePurchaseItemWithName) {
    const listOfItemIdOnCart = itemsCart.map((item) => item.itemId);
    const isAlreadyAdded = [
      ...listOfItemIdOnCart,
      ...listOfItemIdOnExternal,
    ].includes(item.itemId);

    if (isAlreadyAdded) return "Item sudah ada dikeranjang";
    if (item.quantityInHundreds == 0) return "Jumlah barang tidak boleh kosong";
    if (item.totalPrice == 0 || item.pricePerUnit == 0)
      return "Harga tidak boleh kosong";
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
