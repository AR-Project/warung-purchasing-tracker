"use client";

import { useState } from "react";
import VendorEditor from "./VendorEditor";
import PurchaseDateEditor from "./DateEditor";

export type EditorType = "vendor" | "purchase-date" | "sort-item" | "add-item";

type Props = {
  purchase: PurchaseEditor;
};

export function PurchaseEditor({ purchase }: Props) {
  const [activeEditor, setActiveEditor] = useState<EditorType | null>(null);

  return (
    <div className="flex flex-col w-full gap-3">
      <VendorEditor
        currentName={purchase.vendorName}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        purchaseId={purchase.id}
      />
      <PurchaseDateEditor
        currentDate={purchase.purchasesAt}
        activeEditor={activeEditor}
        purchaseId={purchase.id}
        setActiveEditor={setActiveEditor}
      />
    </div>
  );
}
