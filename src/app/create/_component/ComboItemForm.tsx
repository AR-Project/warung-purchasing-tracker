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
import { LuLoader2 } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import { MdAdd } from "react-icons/md";

import { useDelayQuery } from "@/presentation/hooks/useDelayQuery";
import { searchItems } from "@/lib/api";
import { anyNumberToHundred, anyNumberToNumber } from "@/lib/utils/validator";

import { ResetItemInputButton } from "../_presentation/ResetItemInputButton";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";

const EditItemHiddenForm = dynamic(() => import("./EditItemHiddenForm"));
const AddItemHiddenForm = dynamic(() => import("./AddItemHiddenForm"));

type Props = {
  appendItemOnCart: (item: PurchasedItem) =>
    | {
        error: string;
      }
    | undefined;
};

const INITIAL: Vendor = { id: "", name: "" };

type NumberFormState = number | "";

export default function ComboItemForm({ appendItemOnCart }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [itemsSelection, setItemsSelection] = useState<Item[]>([]);

  const [query, setQuery] = useState("");
  const [delayedQuery] = useDelayQuery(query, 500);

  const [newItemName, setNewItemName] = useState<string | undefined>();

  const [selectedItem, setSelectedItem] = useState<Item>({ id: "", name: "" });

  const [quantity, setQuantity] = useState<NumberFormState>("");
  const [unitPrice, setUnitPrice] = useState<NumberFormState>("");
  const [totalPrice, setTotalPrice] = useState<NumberFormState>("");

  const itemFieldRef = useRef<HTMLInputElement>(null);

  const comboBoxOnChangeHandler = (value: NoInfer<Item> | null) => {
    value && setSelectedItem(value);
  };

  const onCloseComboBox = () => {
    newItemName ? setQuery(newItemName) : setQuery("");
  };

  const comboBoxDisplayValue = (item: Item) => {
    return newItemName ? newItemName : item.name;
  };

  const resetComboForm = () => {
    setSelectedItem(INITIAL);
    setNewItemName(undefined);
    setQuery("");
    setUnitPrice("");
    setTotalPrice("");
    setQuantity("");
    setError(false);
  };

  const searchItemsAction = async (delayedQuery: string) => {
    if (delayedQuery.length < 3) return;
    setLoading(true);
    try {
      const response = await searchItems(delayedQuery);
      if (response.status === 200) {
        const data = (await response.json()) as unknown as Item[];
        setItemsSelection(data);
        setNewItemName(undefined);
      } else {
        setNewItemName(query);
        setItemsSelection([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const enableSubmitButton = () => {
    const isItemSelected = selectedItem.id !== "";
    const isQuantityProvided = typeof quantity === "number" && quantity > 0;
    const isUnitPriceProvided = typeof unitPrice === "number" && unitPrice > 0;

    if (isItemSelected && isQuantityProvided && isUnitPriceProvided)
      return true;
    return false;
  };

  const displayEditButton = () => {
    const isItemSelected = selectedItem.id !== "";
    const isQueryEmpty = query === "";

    if (isItemSelected && isQueryEmpty) return true;
    return false;
  };

  const finalizeItem = () => {
    const result = appendItemOnCart({
      itemId: selectedItem.id,
      name: selectedItem.name,
      quantityInHundreds: anyNumberToHundred(quantity),
      pricePerUnit: anyNumberToNumber(unitPrice),
      totalPrice: anyNumberToNumber(totalPrice),
    });

    if (!result?.error) {
      resetComboForm();
      itemFieldRef.current?.focus();
      return;
    }

    setError(true);
  };

  useStateChanged(() => {
    setItemsSelection([]);
    setError(false);
  }, query);

  useStateChanged(() => {
    searchItemsAction(delayedQuery);
  }, delayedQuery);

  return (
    <div className="flex flex-col gap-2">
      <Combobox
        value={selectedItem}
        onChange={comboBoxOnChangeHandler}
        onClose={onCloseComboBox}
      >
        <div className="flex flex-row items-center">
          <ComboboxInput
            aria-label="Assignee"
            ref={itemFieldRef}
            displayValue={comboBoxDisplayValue}
            onChange={(event) => setQuery(event.target.value)}
            className={`bg-gray-800 px-2 h-10 w-full border ${
              error ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Ketik nama item..."
          />
          {displayEditButton() && (
            <EditItemHiddenForm
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          )}

          {selectedItem.id !== "" && (
            <ResetItemInputButton resetComboForm={resetComboForm} />
          )}

          <AddItemHiddenForm
            name={newItemName}
            setSelectedItem={setSelectedItem}
            setNewItemName={setNewItemName}
          />
          {loading && <LuLoader2 className="ml-3 animate-spin text-3xl" />}
          <ComboboxOptions
            anchor="bottom start"
            className="border bg-gray-800 empty:invisible z-50 flex flex-col w-[400px]"
          >
            {itemsSelection.map((item) => (
              <ComboboxOption
                key={item.id}
                value={item}
                className="data-[focus]:bg-gray-500 p-3 w-full"
              >
                {item.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      <div className="grid grid-cols-3 gap-1 items-center">
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
      </div>
      <div className="flex flex-row-reverse">
        <button
          onClick={finalizeItem}
          className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-fit ml-auto disabled:bg-blue-600/30 disabled:text-white/20 disabled:cursor-not-allowed"
          disabled={!enableSubmitButton()}
        >
          <div className="flex flex-row gap-2 items-baseline">
            <MdAdd /> Tambah item
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
