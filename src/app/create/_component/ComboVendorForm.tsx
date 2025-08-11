"use client";
import { useRef, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";
import { MdAdd } from "react-icons/md";

import useList from "@/presentation/hooks/useList";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { createVendor } from "@/app/_globalAction/createVendor.action";

type Props = {
  initialVendors: { id: string; name: string }[];
  selectVendor: (data: Vendor | null) => void;
  selectedVendor: Vendor | null;
  placeholder?: string;
};

export default function ComboVendorForm({
  initialVendors,
  selectedVendor,
  selectVendor: setSelectedVendor,
  placeholder = "Tempat Belanja...",
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
    createVendor,
    (msg, data) => {
      if (!data) return;
      toast.success(msg);
      refreshVendorList();
      setSelectedVendor(data);
    },
    (err) => toast.error(err)
  );

  function newVendorHandler(name: string) {
    const formdata = new FormData();
    formdata.append("name", name);
    newVendorAction(formdata);
  }

  return (
    <div className="flex flex-row items-center basis-3/4 ">
      <Combobox
        value={selectedVendor}
        onChange={(value) => {
          if (!value) return;
          if (value.id === "pending") {
            newVendorHandler(value.name);
          } else {
            setSelectedVendor(value);
          }
        }}
        onClose={() => setQuery("")}
      >
        <ComboboxInput
          ref={comboInputRef}
          aria-label="Assignee"
          displayValue={(item: Vendor | null) => (item ? item.name : "")}
          onChange={(event) => {
            search(event.target.value);
            setQuery(event.target.value);
          }}
          className={`px-2 h-12 w-full border ${
            isCreateModeActive
              ? "bg-yellow-800/50 border-yellow-600"
              : "bg-gray-800 border-gray-600"
          }`}
          placeholder={placeholder}
        />
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
          anchor="bottom start"
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
          {query.length > 3 && (
            <ComboboxOption
              value={{ id: "pending", name: query }}
              className="data-[focus]:bg-green-500/60 p-3 italic bg-green-900 flex flex-row gap-2"
            >
              <MdAdd className="text-xl" /> {query}
            </ComboboxOption>
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
