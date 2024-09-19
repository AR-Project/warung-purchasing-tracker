"use client";
import { SetStateAction, useRef, useState } from "react";
import { DateTime } from "luxon";
import { PiCalendarDotsBold } from "react-icons/pi";

import { formatNumberToIDR, stringToDate } from "@/lib/utils/formatter";
import ComboItemForm from "./ComboItemForm";
import ComboVendorForm from "./ComboVendorForm";
import { ItemCard } from "./ItemCard";
import MakePurchaseHiddenForm from "./MakePurchaseHiddenForm";
import ImageSelector from "./ImageSelector";

const INITIAL: Vendor = { id: "", name: "" };

export default function AddTransaction() {
  const [itemslist, setItemsList] = useState<PurchasedItem[]>([]);
  const [activeItem, setActiveItem] = useState<string>("");

  const [selectedVendor, setSelectedVendor] = useState<Vendor>(INITIAL);
  const [txDate, setTxDate] = useState<string>("");
  const [resizedImage, setResizedImage] = useState<Blob | null>(null);

  const datePickerRef = useRef<HTMLInputElement>(null);

  function resetAddTxForm() {
    setTxDate("");
    setSelectedVendor(INITIAL);
    setResizedImage(null);
    setItemsList([]);
  }

  const appendItem = (item: PurchasedItem) => {
    const isAlreadyAdded =
      itemslist.filter((addedItem) => addedItem.itemId == item.itemId).length >
      0;

    if (isAlreadyAdded) return { error: "Tambahkan item lain" };
    setItemsList((prevItems) => [...prevItems, item]);
  };

  const itemOnClickHandler = (itemId: string) => {
    setActiveItem((prev) => {
      return prev == itemId ? "" : itemId;
    });
  };

  const deleteItem = (itemIndex: number) => {
    setItemsList((prevItems) =>
      [...prevItems].filter((_, index) => index != itemIndex)
    );
  };

  const editPurchasedItem = (updatedItem: PurchasedItem, index: number) => {
    setItemsList((prevItemsList) => {
      const newList = [...prevItemsList];
      newList[index] = updatedItem;
      return newList;
    });
  };

  const totalPurchase = itemslist.reduce(
    (accumulator, item) => accumulator + item.totalPrice,
    0
  );

  const moveItem = (index: number, direction: "up" | "down") => {
    const length = itemslist.length;
    if (index < 0 || index >= length) return;

    setItemsList((prevItemList) => {
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

  return (
    <div className="flex flex-col p-4 gap-3 w-full max-w-[700px] mx-auto">
      <div className="flex flex-col">
        <button
          className=" bg-gray-800 w-full h-10 border border-gray-600 flex flex-row gap-3 items-center"
          onClick={() => datePickerRef.current?.showPicker()}
          title="Tanggal Transaksi"
        >
          <div className="h-10 aspect-square flex flex-row justify-center items-center border-r border-gray-600">
            <PiCalendarDotsBold />
          </div>
          {txDate === "" ? (
            <span className="text-white/50 italic text-xs">
              Pilih Tanggal Transaksi...
            </span>
          ) : (
            stringToDate(txDate)
          )}
        </button>
        <input
          ref={datePickerRef}
          className="w-[0px] h-[0px]"
          type="date"
          name="date"
          id="date"
          onChange={(e) => setTxDate(e.target.value)}
        />
      </div>

      <ComboVendorForm
        selectedVendor={selectedVendor}
        setSelectedVendor={setSelectedVendor}
      />

      <ImageSelector
        resizedFile={resizedImage}
        setResizedFile={setResizedImage}
      />

      {itemslist.length === 0 && (
        <span className="w-full h-full italic text-center text-sm text-gray-600 border border-gray-600/50 p-3">
          Transaksi kosong...
        </span>
      )}
      {itemslist.length > 0 && (
        <div className="max-h-64 overflow-y-scroll flex flex-col font-mono">
          {itemslist.map((item, index) => (
            <ItemCard
              key={item.itemId}
              onClick={itemOnClickHandler}
              isActive={activeItem == item.itemId}
              item={item}
              index={index}
              moveItem={moveItem}
              deleteItem={deleteItem}
              editPurchasedItem={editPurchasedItem}
            />
          ))}
        </div>
      )}

      <h4 className="text-xl font-black text-center border border-gray-700 p-2">
        {formatNumberToIDR(totalPurchase)}
      </h4>

      <ComboItemForm appendItem={appendItem} />

      <MakePurchaseHiddenForm
        purchasedAt={txDate}
        vendorId={selectedVendor.id}
        itemsList={itemslist}
        totalPurchase={totalPurchase}
        image={resizedImage}
        clearFrom={resetAddTxForm}
      />
      <button onClick={() => resetAddTxForm()}>Reset</button>
    </div>
  );
}
