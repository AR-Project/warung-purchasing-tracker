"use client";
import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";
import { MdAdd, MdLocationOn, MdWarning } from "react-icons/md";

import useList from "@/presentation/hooks/useList";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { newVendor } from "@/app/_globalAction/newVendor.action";

type Props = {
  initialVendors: { id: string; name: string }[];
  selectVendor: (data: Vendor | null) => void;
  selectedVendor: Vendor | null;
};

export default function ComboVendorForm({
  initialVendors,
  selectedVendor,
  selectVendor: setSelectedVendor,
}: Props) {
  const [query, setQuery] = useState("");
  const {
    refreshList: refreshVendorList,
    filteredList,
    search,
  } = useList("/api/list/vendor", initialVendors);

  const comboInputRef = useRef<HTMLInputElement>(null);

  const isCreateModeActive =
    selectedVendor !== null && selectedVendor.id === "pending";

  const [newVendorAction] = useServerAction(
    newVendor,
    (msg, data) => {
      if (!data) return;
      toast.success(msg);
      refreshVendorList();
      setSelectedVendor(data);
    },
    (err) => toast.error(err)
  );

  function newVendorHandler() {
    const formdata = new FormData();
    if (selectedVendor) formdata.append("name", selectedVendor.name);
    newVendorAction(formdata);
  }

  return (
    <div className="flex flex-row items-center ">
      <Combobox
        value={selectedVendor}
        onChange={(value) => value && setSelectedVendor(value)}
        onClose={() => setQuery("")}
      >
        <button
          onClick={() => comboInputRef.current?.focus()}
          className="flex flex-row justify-center items-center h-10 aspect-square border-t border-l border-b border-gray-600 bg-gray-800"
        >
          <MdLocationOn />
        </button>
        <ComboboxInput
          ref={comboInputRef}
          aria-label="Assignee"
          displayValue={(item: Vendor | null) => (item ? item.name : "")}
          onChange={(event) => {
            search(event.target.value);
            setQuery(event.target.value);
          }}
          className={` px-2 h-10 w-full border ${
            isCreateModeActive
              ? "bg-yellow-800/50 border-yellow-600"
              : "bg-gray-800 border-gray-600"
          }`}
          placeholder="Tempat Belanja"
        />

        {isCreateModeActive && (
          <>
            <div className="group relative h-10 flex flex-row items-center px-1 bg-yellow-900/50 border-t border-r border-b border-yellow-600">
              <MdWarning className="text-yellow-300 text-2xl" />
              <p className="transition-opacity ease-in-out duration-150 opacity-0 group-hover:opacity-100 translate-y-full -translate-x-1/2 absolute z-40 bottom-0 text-xs  bg-yellow-300 text-yellow-800 p-0.5 whitespace-nowrap">
                Vendor baru belum disimpan
              </p>
            </div>
            <button
              className="flex flex-row gap-2 px-2 h-10 items-center bg-green-900 border-t border-b border-gray-500  w-fit hover:bg-green-800 disabled:text-white/50"
              onClick={() => newVendorHandler()}
            >
              <MdAdd className="text-xl" />
              <div className="text-xs ">Simpan</div>
            </button>
          </>
        )}
        {selectedVendor && (
          <button
            className="border border-gray-600 bg-gray-800 aspect-square h-10 flex items-center justify-center w-fit ml-auto"
            tabIndex={-1}
            title="Reset Form"
            onClick={() => {
              setSelectedVendor(null);
              setQuery("");
            }}
          >
            <RxCross2 />
          </button>
        )}
        <ComboboxOptions
          anchor="bottom"
          className="border bg-gray-800 empty:invisible"
        >
          {filteredList.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className="data-[focus]:bg-gray-500 p-3"
            >
              {item.name}
            </ComboboxOption>
          ))}
          <ComboboxOption
            value={{ id: "pending", name: query }}
            className="data-[focus]:bg-green-500/60 p-3 italic bg-green-900 flex flex-row gap-2"
          >
            <MdAdd className="text-xl" /> {query}
          </ComboboxOption>
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
