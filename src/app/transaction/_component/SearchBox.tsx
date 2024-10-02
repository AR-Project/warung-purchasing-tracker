"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { toast } from "react-toastify";
import { LuLoader2 } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { HiSearch } from "react-icons/hi";

import { useDelayQuery } from "@/presentation/hooks/useDelayQuery";

import { ResetItemInputButton } from "@/app/create/_presentation/ResetItemInputButton";
import Tooltip from "@/presentation/component/Tooltip";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";

const INITIAL: Vendor = { id: "", name: "" };

type Props = {
  activeName: string | undefined;
  searchHandler: (query: string) => Promise<Response>;
  placeholder?: string;
};

export default function SearchBox({
  activeName,
  searchHandler,
  placeholder = "Cari item...",
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [itemsSelection, setItemsSelection] = useState<Item[]>([]);

  const [query, setQuery] = useState(activeName ? activeName : "");
  const [delayedQuery] = useDelayQuery(query, 500);

  const [selectedItem, setSelectedItem] = useState<Item>({ id: "", name: "" });

  const itemFieldRef = useRef<HTMLInputElement>(null);

  const comboBoxOnChangeHandler = (value: NoInfer<Item> | null) => {
    value && setSelectedItem(value);
  };

  const onCloseComboBox = () => {
    setQuery("");
  };

  const comboBoxDisplayValue = (item: Item) => {
    return item.name;
  };

  const searchItemsAction = async (delayedQuery: string) => {
    if (delayedQuery.length < 3) return;
    setLoading(true);
    try {
      const response = await searchHandler(delayedQuery);
      if (response.status === 200) {
        const data = (await response.json()) as unknown as Item[];
        setItemsSelection(data);
      } else setItemsSelection([]);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const enableSubmitButton = () => {
    const isItemSelected = selectedItem.id !== "";
    if (isItemSelected) return true;
    return false;
  };

  useStateChanged(() => {
    setItemsSelection([]);
    setError(false);
  }, query);

  useStateChanged(() => {
    searchItemsAction(delayedQuery);
  }, delayedQuery);

  const setNameQuery = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", name);
    return params.toString();
  };

  const clearSearchQuery = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    return params.toString();
  };

  const searchItem = () => {
    router.push(pathname + "?" + setNameQuery(selectedItem.name));
  };

  const resetComboForm = () => {
    router.push(pathname + "?" + clearSearchQuery());
    setSelectedItem(INITIAL);
    setQuery("");
  };

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
            className={`${
              activeName ? "bg-green-700" : "bg-gray-800"
            } px-2 h-10 w-full border ${
              error ? "border-red-500" : "border-gray-600"
            }`}
            placeholder={placeholder}
            disabled={selectedItem.name !== ""}
          />

          {selectedItem.id !== "" && (
            <div className="group relative">
              <ResetItemInputButton resetComboForm={resetComboForm} />
              <Tooltip>Hapus Filter</Tooltip>
            </div>
          )}
          {loading && <LuLoader2 className="ml-3 animate-spin text-3xl" />}
          {!activeName && (
            <button
              onClick={searchItem}
              className="h-10 aspect-square flex flex-row justify-center items-center bg-blue-900 hover:bg-blue-800 border-t border-r border-b border-gray-600 text-white p-1 rounded-sm w-fit ml-auto disabled:bg-blue-600/30 disabled:text-white/20 disabled:cursor-not-allowed"
              disabled={!enableSubmitButton()}
            >
              <HiSearch className="text-2xl" />
            </button>
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
