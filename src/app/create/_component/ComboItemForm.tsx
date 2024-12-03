"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { NumericFormat } from "react-number-format";
import { MdAdd } from "react-icons/md";
import { SlBasket } from "react-icons/sl";

import useList from "@/presentation/hooks/useList";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { anyNumberToHundred, anyNumberToNumber } from "@/lib/utils/validator";
import { ResetItemInputButton } from "../_presentation/ResetItemInputButton";
import { newItemAction } from "../_action/newItem.action";

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

  function newItemHandler(name: string) {
    const formData = new FormData();
    formData.append("name", name);
    newItemFormAction(formData);
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
      <Combobox
        value={selectedItem}
        onChange={(value) => {
          if (!value) return;
          if (value.id === "pending") {
            newItemHandler(value.name);
          } else {
            setSelectedItem(value);
          }
        }}
        onClose={() => setQuery("")}
      >
        <div className="flex flex-row items-center basis-5/6">
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
            } px-1 h-12 w-full border  `}
            placeholder="Ketik nama item..."
          />
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
      <div className="flex flex-row gap-2 items-center justify-stretch">
        <NumericFormat
          className="bg-gray-800 border border-gray-500 p-1 rounded-sm h-16 w-full basis-3/12 "
          value={quantity}
          thousandSeparator=" "
          decimalSeparator=","
          decimalScale={2}
          placeholder="Jumlah"
          onValueChange={(values) => {
            const updatedQuantity = anyNumberToNumber(values.floatValue);
            if (updatedQuantity === 0) return;
            setQuantity(updatedQuantity);
            setUnitPrice("");
            setTotalPrice("");
          }}
        />
        <div className="flex flex-col basis-7/12 w-full">
          <NumericFormat
            className="bg-gray-800 border border-gray-500 p-1 rounded-sm w-full h-8"
            value={unitPrice}
            prefix="Rp"
            thousandSeparator="."
            decimalSeparator=","
            placeholder="Harga satuan"
            onValueChange={(values) => {
              const unitPrice = anyNumberToNumber(values.floatValue);
              if (unitPrice === 0) return;

              setUnitPrice(unitPrice);
              setTotalPrice(unitPrice * anyNumberToNumber(quantity));
            }}
          />
          <NumericFormat
            className="bg-gray-800 border-b border-x border-gray-500 p-1 rounded-sm font-bold w-full h-8"
            value={totalPrice}
            prefix="Rp"
            thousandSeparator="."
            decimalSeparator=","
            placeholder="Total Harga"
            onValueChange={(values) => {
              const totalPrice = anyNumberToNumber(values.floatValue);
              if (totalPrice === 0) return;
              setTotalPrice(totalPrice);
              setUnitPrice(totalPrice / anyNumberToNumber(quantity));
            }}
          />
        </div>
        <button
          onClick={finalizeItem}
          className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm ml-auto disabled:bg-blue-600/30 disabled:text-white/20 disabled:cursor-not-allowed h-16 basis-1/12 px-3"
          disabled={!isPayloadValid()}
        >
          <div className="flex flex-row text-xl items-center justify-center ">
            <MdAdd /> <SlBasket />
          </div>
        </button>
      </div>
    </form>
  );
}
