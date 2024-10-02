"use client";

import { searchVendors } from "@/lib/api";
import { Dispatch, SetStateAction, useState } from "react";
import { MdModeEdit, MdClose } from "react-icons/md";
import UpdatePurchaseVendorHiddenForm from "../_hiddenForm/UpdatePurchaseVendor";
import Selector from "./Selector";

type VendorEditorProps = {
  vendorId: string;
  purchaseId: string;
  activeEditor: string | null;
  currentName: string;
  setActiveEditor: Dispatch<SetStateAction<string | null>>;
};

export default function VendorEditor({
  vendorId,
  activeEditor,
  purchaseId,
  currentName,
  setActiveEditor,
}: VendorEditorProps) {
  const [newPurchaseVendorId, setNewPurchaseVendorId] = useState<string>("");

  const isActive = activeEditor === "vendor";

  function onVendorSelect(id: string | null) {
    setNewPurchaseVendorId(id ? id : "");
  }

  function closeEditor() {
    console.log("success");
    setActiveEditor("");
    setNewPurchaseVendorId("");
  }

  return (
    <div className="relative flex flex-row w-full overflow-clip">
      <div className="flex flex-row w-full justify-between items-center">
        <div className="px-2">{currentName}</div>
        <button
          onClick={() => setActiveEditor("vendor")}
          className="h-10 bg-blue-800 aspect-square flex flex-row justify-center items-center"
        >
          <MdModeEdit />
        </button>
      </div>
      <div
        className={` transition-transform ease-in-out duration-200 absolute flex flex-row w-full  ${
          isActive ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <button
          onClick={closeEditor}
          className="h-10 aspect-square bg-gray-700 text-blue-300 text-3xl flex flex-row justify-center items-center"
        >
          <MdClose />
        </button>
        <Selector
          activeName=""
          isEditorActive={isActive}
          searchHandler={searchVendors}
          placeholder="Ketik nama vendor..."
          onSelect={onVendorSelect}
        />
        {newPurchaseVendorId && (
          <UpdatePurchaseVendorHiddenForm
            purchaseId={purchaseId}
            newPurchaseVendorId={newPurchaseVendorId}
            onSuccess={closeEditor}
          />
        )}
      </div>
    </div>
  );
}
