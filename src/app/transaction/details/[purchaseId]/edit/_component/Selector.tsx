"use client";
import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { toast } from "react-toastify";
import { LuLoader2 } from "react-icons/lu";

import { useDelayQuery } from "@/presentation/hooks/useDelayQuery";

import Tooltip from "@/presentation/component/Tooltip";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";
import { ResetItemInputButton } from "@/app/create/_presentation/ResetItemInputButton";
import UpdatePurchaseVendorHiddenForm from "../_hiddenForm/UpdatePurchaseVendor";

const INITIAL: Vendor = { id: "", name: "" };

type Props = {
  activeName: string | null;
  searchHandler: (query: string) => Promise<Response>;
  placeholder?: string;
  isEditorActive: boolean;
  onSelect: (id: string | null) => void;
};

export default function Selector({
  activeName,
  searchHandler,
  isEditorActive,
  placeholder = "Cari item...",
  onSelect,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [itemsSelection, setItemsSelection] = useState<Item[]>([]);

  const [query, setQuery] = useState("");
  const [delayedQuery] = useDelayQuery(query, 500);

  const [selectedItem, setSelectedItem] = useState<Item>({ id: "", name: "" });

  const [newVendor, setNewVendor] = useState<string | null>(null);
  const [newVendorMode, setNewVendorMode] = useState<boolean>(false);

  const itemFieldRef = useRef<HTMLInputElement>(null);

  function comboBoxOnChangeHandler(value: NoInfer<Item> | null) {
    if (!value) return;
    setSelectedItem(value);
    onSelect(value.id);
  }

  function onCloseComboBox() {
    setQuery("");
  }

  function comboBoxDisplayValue(item: Item) {
    return item.name;
  }

  async function searchItemsAction(delayedQuery: string) {
    if (delayedQuery.length < 3) return;
    setLoading(true);
    try {
      const response = await searchHandler(delayedQuery);
      if (response.status === 200) {
        const data = (await response.json()) as unknown as Item[];
        setItemsSelection(data);
      } else {
        setItemsSelection([]);
        setNewVendorMode(true);
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useStateChanged(() => {
    // Action on every query changed
    setItemsSelection([]);
    setError(false);
    setNewVendorMode(false);
  }, query);

  useStateChanged(() => {
    searchItemsAction(delayedQuery);
  }, delayedQuery);

  useStateChanged(() => {
    if (!isEditorActive) {
      resetComboForm();
    }
  }, isEditorActive);

  function resetComboForm() {
    setSelectedItem(INITIAL);
    setError(false);
    setNewVendorMode(false);
    setQuery("");
    onSelect(null);
  }

  return (
    <div className="flex flex-col w-full ">
      <Combobox
        value={selectedItem}
        onChange={comboBoxOnChangeHandler}
        onClose={onCloseComboBox}
      >
        <div className="flex flex-row items-center w-full">
          <ComboboxInput
            aria-label="Assignee"
            ref={itemFieldRef}
            displayValue={comboBoxDisplayValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setNewVendor(event.target.value);
            }}
            className={`${
              activeName ? "bg-green-700" : "bg-gray-800"
            } px-2 h-10 w-full border ${
              error ? "border-red-500" : "border-gray-600"
            }`}
            placeholder={placeholder}
            disabled={selectedItem.name !== ""}
          />
          {newVendorMode && (
            <span className="h-10 text-xs bg-blue-800 cursor-not-allowed">
              Add New Vendor
            </span>
          )}

          {selectedItem.id !== "" && (
            <ResetItemInputButton resetComboForm={resetComboForm} />
          )}

          {loading && (
            <LuLoader2 className="bg-gray-700 ml-3 animate-spin text-3xl" />
          )}

          <ComboboxOptions
            anchor="bottom"
            className="border bg-gray-800 empty:invisible"
          >
            {itemsSelection.map((item) => (
              <ComboboxOption
                key={item.id}
                value={item}
                className="data-[focus]:bg-gray-500 p-3"
              >
                {item.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
}
