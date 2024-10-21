"use client";
import { Suspense, useState } from "react";
import dynamic from "next/dynamic";

import { formatNumberToIDR } from "@/lib/utils/formatter";

import { ItemOnCartCard } from "../_presentation/ItemOnCartCard";

import MakePurchaseHiddenForm from "./MakePurchaseHiddenForm";
import DatePicker from "./DatePicker";

const ImageSelector = dynamic(() => import("./ImageSelector"));
const ComboItemForm = dynamic(() => import("./ComboItemForm"));
const ComboVendorForm = dynamic(() => import("./ComboVendorForm"));

const INITIAL: Vendor = { id: "", name: "" };

export default function AddTransaction() {
  const [itemsOnCart, setItemsOnCart] = useState<CreatePurchaseItemWithName[]>(
    []
  );
  const [selectedItemOnCart, setSelectedItemOnCart] = useState<string>("");

  const [selectedVendor, setSelectedVendor] = useState<Vendor>(INITIAL);
  const [txDate, setTxDate] = useState<string>("");
  const [resizedImage, setResizedImage] = useState<Blob | null>(null);

  // Manipulate Item List
  const appendItemOnCart = (item: CreatePurchaseItemWithName) => {
    const isAlreadyAdded =
      itemsOnCart.filter((addedItem) => addedItem.itemId == item.itemId)
        .length > 0;

    if (isAlreadyAdded) return "Tambahkan item lain";
    setItemsOnCart((prevItems) => [...prevItems, item]);
  };

  const updateItemOnCart = (
    updatedItem: CreatePurchaseItemWithName,
    index: number
  ) => {
    setItemsOnCart((prevItemsList) => {
      const newList = [...prevItemsList];
      newList[index] = updatedItem;
      return newList;
    });
  };

  const deleteItemOnCart = (itemIndex: number) => {
    setItemsOnCart((prevItems) =>
      [...prevItems].filter((_, index) => index != itemIndex)
    );
  };

  const itemOnCartClickHandler = (itemId: string) => {
    setSelectedItemOnCart((prev) => {
      return prev == itemId ? "" : itemId;
    });
  };

  const totalPurchase = itemsOnCart.reduce(
    (accumulator, item) => accumulator + item.totalPrice,
    0
  );

  const moveItem = (index: number, direction: "up" | "down") => {
    const length = itemsOnCart.length;
    if (index < 0 || index >= length) return;

    setItemsOnCart((prevItemList) => {
      const newList = [...prevItemList];
      if (direction === "up" && index > 0) {
        [newList[index], newList[index - 1]] = [
          newList[index - 1],
          newList[index],
        ];
        // Swap with the previous item
      } else if (direction === "down" && index < newList.length - 1) {
        // Swap with the next item
        [newList[index], newList[index + 1]] = [
          newList[index + 1],
          newList[index],
        ];
      }
      return newList;
    });
  };

  function resetAddTxForm() {
    setTxDate("");
    setSelectedVendor(INITIAL);
    setResizedImage(null);
    setItemsOnCart([]);
  }

  return (
    <div className="flex flex-col p-4 gap-3 w-full max-w-[700px] mx-auto">
      <DatePicker txDate={txDate} setTxDate={setTxDate} />

      <Suspense fallback={<span>loading...</span>}>
        <ComboVendorForm
          selectedVendor={selectedVendor}
          setSelectedVendor={setSelectedVendor}
        />
      </Suspense>

      <Suspense fallback={<span>loading...</span>}>
        <ImageSelector
          resizedFile={resizedImage}
          setResizedFile={setResizedImage}
        />
      </Suspense>

      {itemsOnCart.length === 0 && (
        <span className="w-full h-full italic text-center text-sm text-gray-600 border border-gray-600/50 p-3">
          Transaksi kosong...
        </span>
      )}
      {itemsOnCart.length > 0 && (
        <div className="max-h-64 overflow-y-scroll flex flex-col font-mono">
          {itemsOnCart.map((item, index) => (
            <ItemOnCartCard
              key={item.itemId}
              onClick={itemOnCartClickHandler}
              isActive={selectedItemOnCart == item.itemId}
              item={item}
              index={index}
              deleteItem={deleteItemOnCart}
              editPurchasedItem={updateItemOnCart}
            />
          ))}
        </div>
      )}

      <h4 className="text-xl font-black text-center border border-gray-700 p-2">
        {formatNumberToIDR(totalPurchase)}
      </h4>
      <Suspense fallback={<span>loading...</span>}>
        <ComboItemForm appendItemOnCart={appendItemOnCart} />
      </Suspense>

      <MakePurchaseHiddenForm
        purchasedAt={txDate}
        vendorId={selectedVendor.id}
        listOfPurchaseItem={itemsOnCart}
        totalPurchase={totalPurchase}
        image={resizedImage}
        clearFrom={resetAddTxForm}
      />
      <button onClick={() => resetAddTxForm()}>Reset</button>
    </div>
  );
}
