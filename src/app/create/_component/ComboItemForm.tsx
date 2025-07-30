"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { NumericFormat } from "react-number-format";
import { MdAdd } from "react-icons/md";
import { SlBasket } from "react-icons/sl";
import { ImSpinner5 } from "react-icons/im";

import { createItemAction } from "@/app/_globalAction/item/createItem.action";
import useList from "@/presentation/hooks/useList";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { anyNumberToHundred, anyNumberToNumber } from "@/lib/utils/validator";
import { ResetItemInputButton } from "../_presentation/ResetItemInputButton";

type Props = {
  initialItems: { id: string; name: string }[];
  appendItemOnCart: (item: CreatePurchaseItemWithName) => string | undefined;
};

type NumberFormState = number | "";

export default function ComboItemForm({
  initialItems,
  appendItemOnCart,
}: Props) {
  const [itemAppendError, setItemAppendError] = useState<string>("");

  const [isUnitPriceActive, setIsUnitPriceActive] = useState<boolean>(false);
  const [isTotalPriceActive, setIsTotalPriceActive] = useState<boolean>(false);

  const {
    filteredList,
    refreshList: refreshItemList,
    search,
  } = useList("/api/list/item", initialItems);
  const [query, setQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [quantity, setQuantity] = useState<NumberFormState>("");
  const [unitPrice, setUnitPrice] = useState<NumberFormState>("");
  const [totalPrice, setTotalPrice] = useState<NumberFormState>("");

  const itemFieldRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function updateItem(data: Item) {
    setSelectedItem(data);
  }

  function resetComboForm() {
    setSelectedItem(null);
    setQuery("");
    setUnitPrice("");
    setTotalPrice("");
    setQuantity("");
    setItemAppendError("");
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
    if (!isPayloadValid()) return;

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
    } else {
      setItemAppendError(result);
    }
  }

  const [createItemWrappedAction, isCreateItemPending] = useServerAction(
    createItemAction,
    (msg, data) => {
      if (!data) return;
      refreshItemList();
      updateItem(data);
      toast.success(msg);
    },
    (err) => toast.error(err)
  );

  function createItemHandler(name: string) {
    const formData = new FormData();
    formData.append("name", name);
    createItemWrappedAction(formData);
  }

  const textSizeClass = useMemo(() => {
    const length = quantity.toString().length;
    if (length === 1) {
      return "text-2xl";
    }
    if (length === 2) {
      return "text-xl";
    }
    if (length === 3) {
      return "text-lg";
    }
    // Default for 0 or 4+ characters
    return "text-md";
  }, [quantity]);

  function focusOnForm() {
    if (!formRef.current) return;
    formRef.current.focus();
  }

  useEffect(() => {
    focusOnForm();
  }, []);

  return (
    <form
      className="relative flex flex-col gap-2"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        finalizeItem();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          finalizeItem();
        }
      }}
      onSubmitCapture={(e) => {
        e.preventDefault();
        finalizeItem();
      }}
    >
      {itemAppendError && (
        <div className="w-full text-xs italic text-red-500 text-center">
          {itemAppendError}
        </div>
      )}

      {isCreateItemPending && <SaveItemPending />}
      <Combobox
        value={selectedItem}
        onChange={(value) => {
          if (!value) return;

          // Creating new Item is handled here, when option is selected
          if (value.id === "pending") {
            createItemHandler(value.name);
          } else {
            setSelectedItem(value);
          }
        }}
        onClose={() => setQuery("")}
      >
        <div className="flex flex-row">
          <ComboboxInput
            aria-label="Assignee"
            ref={itemFieldRef}
            displayValue={(item: Item | null) => (item ? item.name : "")}
            value={selectedItem ? selectedItem.name : query}
            onChange={(event) => {
              setSelectedItem(null);
              search(event.target.value);
              setQuery(event.target.value);
              setItemAppendError("");
            }}
            className={`bg-gray-800 border-gray-600 px-1 h-12 w-full border placeholder:italic placeholder:text-xs/tight `}
            placeholder="Ketik nama item..."
          />
          {selectedItem && (
            <ResetItemInputButton resetComboForm={resetComboForm} />
          )}
        </div>
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
          {query && query.length > 3 && (
            <ComboboxOption
              value={{ id: "pending", name: query }}
              className="data-[focus]:bg-green-500/60 p-3 italic bg-green-900 flex flex-row gap-2"
            >
              <MdAdd className="text-xl" /> {query}
            </ComboboxOption>
          )}
        </ComboboxOptions>
      </Combobox>

      <div className="flex flex-row gap-2 items-center justify-stretch font-mono">
        <NumericFormat
          className={`${textSizeClass} bg-gray-800 border border-gray-500 p-1 rounded-sm h-16 w-full basis-3/12 placeholder:italic placeholder:text-xs/tight text-center`}
          value={quantity}
          thousandSeparator=" "
          decimalSeparator=","
          decimalScale={2}
          min={0}
          placeholder="Jumlah..."
          onValueChange={({ floatValue }) => {
            const updatedQuantity = anyNumberToNumber(floatValue);
            if (updatedQuantity === 0) return;
            setQuantity(updatedQuantity);
            setUnitPrice("");
            setTotalPrice("");
          }}
        />
        <div className="flex flex-col basis-7/12 w-full">
          <NumericFormat
            className="bg-gray-800 border border-gray-500 px-1 rounded-t-md w-full h-8 placeholder:italic placeholder:text-xs/tight text-lg text-right"
            value={unitPrice}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={0}
            placeholder="Harga satuan"
            onFocus={() => setIsUnitPriceActive(true)}
            onBlur={() => setIsUnitPriceActive(false)}
            onValueChange={({ floatValue }) => {
              if (!isUnitPriceActive) return;

              const unitPrice = anyNumberToNumber(floatValue);
              if (unitPrice === 0) return;

              setUnitPrice(unitPrice);
              setTotalPrice(unitPrice * anyNumberToNumber(quantity));
            }}
          />
          <NumericFormat
            className="bg-gray-800 border-b border-x border-gray-500 px-1 rounded-b-md font-bold w-full h-8 placeholder:italic placeholder:text-xs/tight text-lg text-right"
            value={totalPrice}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={0}
            onFocus={() => setIsTotalPriceActive(true)}
            onBlur={() => setIsTotalPriceActive(false)}
            placeholder="Total Harga"
            onValueChange={({ floatValue }) => {
              if (!isTotalPriceActive) return;

              const totalPrice = anyNumberToNumber(floatValue);
              if (totalPrice === 0) return;
              setTotalPrice(totalPrice);
              setUnitPrice(totalPrice / anyNumberToNumber(quantity));
            }}
          />
        </div>
        <button
          type="submit"
          onClick={() => finalizeItem()}
          onTouchEnd={() => finalizeItem()}
          className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm ml-auto disabled:bg-blue-600/30 disabled:text-white/20 disabled:cursor-not-allowed h-16 basis-1/12 px-3"
          disabled={!isPayloadValid()}
          onSubmit={(e) => {
            e.preventDefault();
            finalizeItem();
          }}
          onSubmitCapture={(e) => {
            e.preventDefault();
            finalizeItem();
          }}
        >
          <div className="flex flex-row text-xl items-center justify-center ">
            <MdAdd /> <SlBasket />
          </div>
        </button>
      </div>
    </form>
  );
}

function SaveItemPending() {
  return (
    <div className="absolute top-0 bg-black/70 h-full w-full text-sm italic  ">
      <div className=" animate-pulse flex-row flex h-full w-full items-center justify-center gap-2">
        <ImSpinner5 className="animate-spin text-lg/tight" />
        <div>Menyimpan item baru ke server. Mohon tunggu...</div>
      </div>
    </div>
  );
}
