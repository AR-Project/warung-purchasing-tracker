"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { MdClose, MdModeEdit } from "react-icons/md";
import Selector from "./Selector";
import { searchVendors } from "@/lib/api";
import UpdatePurchaseVendorHiddenForm from "../_hiddenForm/UpdatePurchaseVendor";
import VendorEditor from "./VendorEditor";

type Props = {
  purchase: PurchaseEditor;
};

export function PurchaseEditor({ purchase }: Props) {
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  return (
    <div className="flex flex-col w-full gap-1">
      <div className="text-sm italic px-2">Vendor</div>
      <VendorEditor
        currentName={purchase.vendorName}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        vendorId={purchase.vendorId}
        purchaseId={purchase.id}
      />
      <div className="flex flex-row w-full justify-between border border-gray-500/20 items-center rounded-sm bg-gray-950"></div>
    </div>
  );
}
