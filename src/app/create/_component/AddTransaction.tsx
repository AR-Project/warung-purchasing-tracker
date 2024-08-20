"use client";
import { useRef, useState } from "react";
import { DateTime } from "luxon";
import { PiCalendarDotsBold } from "react-icons/pi";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import ComboItemForm from "./ComboItemForm";
import ComboVendorForm from "./ComboVendorForm";
import { ItemCard } from "./ItemCard";
import MakePurchaseHiddenForm from "./MakePurchaseHiddenForm";

const INITIAL: Vendor = { id: "", name: "" };

export default function AddTransaction() {
  const [itemslist, setItemsList] = useState<PurchasedItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor>(INITIAL);
  const [txDate, setTxDate] = useState<string>("");

  const appendItem = (item: PurchasedItem) => {
    const isAlreadyAdded =
      itemslist.filter((addedItem) => addedItem.itemId == item.itemId).length >
      0;

    if (isAlreadyAdded) return { error: "Tambahkan item lain" };
    setItemsList((prevItems) => [...prevItems, item]);
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

  const prettyDate = () => {
    return DateTime.fromISO(txDate).setLocale("id").toLocaleString({
      weekday: "short",
      month: "long",
      day: "2-digit",
    });
  };

  const datePickerRef = useRef<HTMLInputElement>(null);

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
      <div className="flex flex-row gap-1">
        <input
          ref={datePickerRef}
          className="hidden"
          type="date"
          name="date"
          id="date"
          onChange={(e) => setTxDate(e.target.value)}
        />
        <button
          className="basis-1/3 bg-blue-900 h-10 border border-gray-500 flex flex-row items-center gap-3 px-2"
          onClick={() => datePickerRef.current?.showPicker()}
          title="Tanggal Transaksi"
        >
          <PiCalendarDotsBold />
          {txDate !== "" ? (
            prettyDate()
          ) : (
            <span className="text-white/50 italic text-xs">
              tanggal transaksi...
            </span>
          )}
        </button>
        <div className=" basis-2/3">
          <ComboVendorForm
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
          />
        </div>
      </div>

      {itemslist.length === 0 && (
        <span className="w-full italic text-center text-sm text-gray-600 border border-gray-600/50 p-3">
          Transaksi kosong...
        </span>
      )}

      {itemslist.map((item, index) => (
        <ItemCard
          key={item.itemId}
          item={item}
          index={index}
          moveItem={moveItem}
          deleteItem={deleteItem}
          editPurchasedItem={editPurchasedItem}
        />
      ))}

      <h4 className="text-xl font-black text-center bg-gray-800 p-2">
        {formatNumberToIDR(totalPurchase)}
      </h4>
      <ComboItemForm appendItem={appendItem} />
      <MakePurchaseHiddenForm
        purchasedAt={txDate}
        vendorId={selectedVendor.id}
        itemsList={itemslist}
        totalPurchase={totalPurchase}
      />
    </div>
  );
}
