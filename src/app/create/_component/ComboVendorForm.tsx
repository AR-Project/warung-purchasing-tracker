"use client";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { toast } from "react-toastify";
import { LuLoader2 } from "react-icons/lu";

import { useDelayQuery } from "@/presentation/hooks/useDelayQuery";
import AddVendorHiddenForm from "./AddVendorHiddenForm";
import { searchVendors } from "@/lib/api";
import { RxCross2 } from "react-icons/rx";

const INITIAL: Vendor = { id: "", name: "" };

// TODO: Drill vendorSelection and setVendorSelection from parent

type Props = {
  setSelectedVendor: Dispatch<SetStateAction<Vendor>>;
  selectedVendor: Vendor;
};

export default function ComboVendorForm({
  selectedVendor,
  setSelectedVendor,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  const [vendorsSelection, setVendorsSelection] = useState<Vendor[]>([]);

  const [query, setQuery] = useState("");
  const [delayedQuery] = useDelayQuery(query);

  const [newVendorName, setNewVendorName] = useState<string | undefined>();

  const comboBoxOnChangeHandler = (value: NoInfer<Vendor> | null) => {
    value && setSelectedVendor(value);
  };

  const onCloseComboBox = () => {
    newVendorName ? setQuery(newVendorName) : setQuery("");
  };

  const comboBoxDisplayValue = (item: Vendor) => {
    return newVendorName ? newVendorName : item.name;
  };

  useEffect(() => {
    setVendorsSelection([]);
    if (delayedQuery.length < 2) return;
    (async () => {
      setLoading(true);
      try {
        const response = await searchVendors(delayedQuery);
        if (response.status === 200) {
          const data = (await response.json()) as unknown as Item[];
          setVendorsSelection(data);
          setNewVendorName(undefined);
        } else {
          setNewVendorName(query);
          setVendorsSelection([]);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        toast.error("unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [delayedQuery]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row items-center ">
        <Combobox
          value={selectedVendor}
          onChange={comboBoxOnChangeHandler}
          onClose={onCloseComboBox}
        >
          <ComboboxInput
            aria-label="Assignee"
            displayValue={comboBoxDisplayValue}
            onChange={(event) => setQuery(event.target.value)}
            className="bg-gray-800 px-2 h-10 w-full border border-gray-600"
            placeholder="Tempat Belanja"
          />
          <AddVendorHiddenForm
            name={newVendorName}
            setSelected={setSelectedVendor}
            setNewName={setNewVendorName}
          />
          {selectedVendor.id !== "" && (
            <button
              className="border border-gray-600 bg-gray-800 aspect-square h-10 flex items-center justify-center w-fit ml-auto"
              tabIndex={-1}
              title="Reset Form"
              onClick={() => {
                setSelectedVendor(INITIAL);
                setNewVendorName(undefined);
                setQuery("");
              }}
            >
              <RxCross2 />
            </button>
          )}

          {loading && <LuLoader2 className="ml-3 animate-spin text-3xl" />}
          <ComboboxOptions
            anchor="bottom"
            className="border bg-gray-800 empty:invisible"
          >
            {vendorsSelection.map((item) => (
              <ComboboxOption
                key={item.id}
                value={item}
                className="data-[focus]:bg-gray-500 p-3"
              >
                {item.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </div>
    </div>
  );
}
