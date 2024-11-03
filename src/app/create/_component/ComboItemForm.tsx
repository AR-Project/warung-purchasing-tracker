"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { NumericFormat } from "react-number-format";
import { MdAdd } from "react-icons/md";

import useList from "@/presentation/hooks/useList";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { anyNumberToHundred, anyNumberToNumber } from "@/lib/utils/validator";
import { ResetItemInputButton } from "../_presentation/ResetItemInputButton";
import { newItemAction } from "../_action/newItem.action";

const EditItemHiddenForm = dynamic(() => import("./EditItemHiddenForm"));

type Props = {
  initialItems: { id: string; name: string }[];
  appendItemOnCart: (item: CreatePurchaseItemWithName) => string | undefined;
};

type NumberFormState = number | "";

export default function ComboItemForm({
  initialItems,
  appendItemOnCart,
}: Props) {
  const [error, setError] = useState<boolean>(false);

  const { filteredList, refreshList, search } = useList(
    "/api/list/item",
    initialItems
  );
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [quantity, setQuantity] = useState<NumberFormState>("");
  const [unitPrice, setUnitPrice] = useState<NumberFormState>("");
  const [totalPrice, setTotalPrice] = useState<NumberFormState>("");

  const itemFieldRef = useRef<HTMLInputElement>(null);

  const isCreateModeActive =
    selectedItem !== null && selectedItem.id === "pending";

  const isEditItemModeEnabled =
    selectedItem !== null && selectedItem.id !== "pending";

  function updateItem(data: Item) {
    setSelectedItem(data);
  }

  function resetComboForm() {
    setSelectedItem(null);
    setQuery("");
    setUnitPrice("");
    setTotalPrice("");
    setQuantity("");
    setError(false);
  }

  function isPayloadValid() {
    const isItemValid = selectedItem !== null && selectedItem.id !== "pending";
    const isQuantityValid = typeof quantity === "number" && quantity > 0;
    const isUnitPriceValid = typeof unitPrice === "number" && unitPrice > 0;

    if (isItemValid && isQuantityValid && isUnitPriceValid) return true;
    return false;
  }

  function finalizeItem() {
    if (!selectedItem) return;
    const result = appendItemOnCart({
      itemId: selectedItem.id,
      name: selectedItem.name,
      quantityInHundreds: anyNumberToHundred(quantity),
      pricePerUnit: anyNumberToNumber(unitPrice),
      totalPrice: anyNumberToNumber(totalPrice),
    });

    if (!result) {
      resetComboForm();
      itemFieldRef.current?.focus();
      return;
    }
    setError(true);
  }

  const [newItemFormAction] = useServerAction(
    newItemAction,
    (msg, data) => {
      if (!data) return;
      refreshList();
      updateItem(data);
      toast.success(msg);
    },
    (err) => toast.error(err)
  );

  function newItemHandler() {
    const formData = new FormData();
    if (selectedItem) formData.append("name", selectedItem.name);
    newItemFormAction(formData);
  }

  return (
    <div className="flex flex-col gap-2">
      <Combobox
        value={selectedItem}
        onChange={(value) => value && setSelectedItem(value)}
        onClose={() => setQuery("")}
      >
        <div className="flex flex-row items-center">
          <ComboboxInput
            aria-label="Assignee"
            ref={itemFieldRef}
            displayValue={(item: Item | null) => (item ? item.name : "")}
            onChange={(event) => {
              search(event.target.value);
              setQuery(event.target.value);
              setError(false);
            }}
            className={`${
              isCreateModeActive
                ? "bg-yellow-800/50 border-yellow-600"
                : "bg-gray-800"
            } ${
              error ? "border-red-500" : "border-gray-600"
            } px-2 h-10 w-full border `}
            placeholder="Ketik nama item..."
          />
          {isEditItemModeEnabled && (
            <EditItemHiddenForm
              selectedItem={selectedItem}
              updateItem={updateItem}
            />
          )}

          {isCreateModeActive && (
            <button
              onClick={() => newItemHandler()}
              className=" flex flex-row gap-1 h-10 px-1.5 items-center bg-green-900 border border-gray-500 rounded-sm  w-fit hover:bg-green-800"
            >
              <MdAdd className="text-xl" />
              <span className="text-xs">Simpan</span>
            </button>
          )}
          {selectedItem && (
            <ResetItemInputButton resetComboForm={resetComboForm} />
          )}

          <ComboboxOptions
            anchor="bottom start"
            className="border bg-gray-800 empty:invisible z-50 flex flex-col w-[400px]"
          >
            {filteredList.map((item) => (
              <ComboboxOption
                key={item.id}
                value={item}
                className="data-[focus]:bg-gray-500 p-3 w-full"
              >
                {item.name}
              </ComboboxOption>
            ))}
            {query.length > 3 && (
              <ComboboxOption
                value={{ id: "pending", name: query }}
                className="data-[focus]:bg-green-500/60 p-3 italic bg-green-900 flex flex-row gap-2"
              >
                <MdAdd className="text-xl" /> {query}
              </ComboboxOption>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      <form className="grid grid-cols-3 gap-1 items-center">
        <NumericFormat
          className="bg-gray-800 border border-gray-500 p-1 rounded-sm"
          value={quantity}
          thousandSeparator=" "
          decimalSeparator=","
          decimalScale={2}
          placeholder="Jumlah"
          onValueChange={(values) => {
            const updatedQuantity = anyNumberToNumber(values.floatValue);
            setQuantity(updatedQuantity);
            setUnitPrice("");
            setTotalPrice("");
          }}
        />
        <NumericFormat
          className="bg-gray-800 border border-gray-500 p-1 rounded-sm"
          value={unitPrice}
          prefix="Rp"
          thousandSeparator="."
          decimalSeparator=","
          placeholder="Harga satuan"
          onValueChange={(values) => {
            const unitPrice = anyNumberToNumber(values.floatValue);
            setUnitPrice(unitPrice);
            setTotalPrice(unitPrice * anyNumberToNumber(quantity));
          }}
        />
        <NumericFormat
          className="bg-gray-800 border border-gray-500 p-1 rounded-sm font-bold"
          value={totalPrice}
          prefix="Rp"
          thousandSeparator="."
          decimalSeparator=","
          placeholder="Total"
          onValueChange={(values) => {
            const totalPrice = anyNumberToNumber(values.floatValue);
            setTotalPrice(totalPrice);
            setUnitPrice(totalPrice / anyNumberToNumber(quantity));
          }}
        />
      </form>
      <div className="flex flex-row-reverse">
        <button
          onClick={finalizeItem}
          className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-fit ml-auto disabled:bg-blue-600/30 disabled:text-white/20 disabled:cursor-not-allowed"
          disabled={!isPayloadValid()}
        >
          <div className="flex flex-row gap-2 items-baseline">
            <MdAdd /> Masukkan Keranjang
          </div>
        </button>
        {error && (
          <p className="text-red-500 text-xs uppercase italic">
            Barang sudah terdaftar. Ganti atau ubah barang
          </p>
        )}
      </div>
    </div>
  );
}
