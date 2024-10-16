"use client";

import { useState } from "react";
import VendorEditor from "./VendorEditor";
import PurchaseDateEditor from "./PurchaseDateEditor";

export type EditorType =
  | "vendor"
  | "purchase-date"
  | "sort-item"
  | "add-item"
  | "delete-item"
  | "edit-data-item";

type Props = {
  purchase: PurchaseEditor;
};

export function PurchaseDataEditor({ purchase }: Props) {
  const [activeEditor, setActiveEditor] = useState<EditorType | null>(null);

  function selectEditor(type: EditorType | null) {
    setActiveEditor(type);
  }

  return (
    <div className="flex flex-col w-full gap-3 mb-5">
      <PurchaseDateEditor
        currentDate={purchase.purchasesAt}
        activeEditor={activeEditor}
        purchaseId={purchase.id}
        selectEditor={selectEditor}
      />
      <VendorEditor
        currentName={purchase.vendorName}
        activeEditor={activeEditor}
        selectEditor={selectEditor}
        purchaseId={purchase.id}
      />
    </div>
  );
}
