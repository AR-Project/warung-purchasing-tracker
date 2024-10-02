"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { searchVendors } from "@/lib/api";
import UpdatePurchaseVendorHiddenForm from "../_hiddenForm/UpdatePurchaseVendor";
import Selector from "./Selector";
import { EditorType } from "./PurchaseEditor";
import ShowEditorButton from "../_presentation/ShowEditorButton";
import CloseEditorButton from "../_presentation/CloseEditorButton";

type VendorEditorProps = {
  purchaseId: string;
  activeEditor: string | null;
  currentName: string;
  setActiveEditor: Dispatch<SetStateAction<EditorType | null>>;
};

export default function VendorEditor({
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
    setActiveEditor(null);
    setNewPurchaseVendorId("");
  }

  return (
    <div>
      <div className="text-sm italic px-2 text-gray-500">Vendor</div>
      <div className="relative flex flex-row w-full overflow-clip">
        {/* Displayer */}
        <div className="flex flex-row w-full justify-between items-center border border-gray-600/30">
          <div className="px-2">{currentName}</div>
          <ShowEditorButton onClick={() => setActiveEditor("vendor")} />
        </div>

        {/* Pop-up Editor */}
        <div
          className={` transition-transform ease-in-out duration-200 absolute flex flex-row w-full  ${
            isActive ? "translate-x-[0%]" : "translate-x-[100%]"
          }`}
        >
          <CloseEditorButton onClick={closeEditor} />
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
    </div>
  );
}
