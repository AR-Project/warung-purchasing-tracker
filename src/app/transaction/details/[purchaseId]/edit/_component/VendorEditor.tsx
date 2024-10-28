"use client";

import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { RxCross1 } from "react-icons/rx";
import { MdKeyboardDoubleArrowDown, MdModeEdit } from "react-icons/md";

import UpdatePurchaseVendorHiddenForm from "../_hiddenForm/UpdatePurchaseVendor";
import ComboVendorForm from "@/app/create/_component/ComboVendorForm";

type VendorEditorProps = {
  purchaseId: string;
  currentVendor: { id: string; name: string };
  initialVendor: { id: string; name: string }[];
};

export default function VendorEditor({
  purchaseId,
  currentVendor,
  initialVendor,
}: VendorEditorProps) {
  const [newPurchaseVendor, setNewPurchaseVendor] = useState<Vendor | null>(
    null
  );

  function selectVendor(data: Vendor | null) {
    if (!data) return;
    setNewPurchaseVendor(data);
  }

  return (
    <Disclosure>
      {({ open, close }) => (
        <div className={`${open && "border border-yellow-600"} mb-10`}>
          <DisclosureButton
            className={` ${
              open && "bg-yellow-600/30"
            } h-10 flex flex-row w-full justify-between items-center border border-gray-600/30 bg-blue-900/50`}
          >
            <div className="px-2">{currentVendor.name}</div>
            <div className="h-10 bg-blue-800 aspect-square flex flex-row justify-center items-center">
              {open ? <RxCross1 /> : <MdModeEdit />}
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className={`origin-top transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0 ${
              open && "bg-yellow-600/30"
            }`}
          >
            <div className="w-full flex flex-row justify-center p-2 text-xl">
              <MdKeyboardDoubleArrowDown />
              <MdKeyboardDoubleArrowDown />
            </div>
            <div className="flex flex-row">
              <div className="w-full">
                <ComboVendorForm
                  initialVendors={initialVendor}
                  selectVendor={selectVendor}
                  selectedVendor={newPurchaseVendor}
                  placeholder="Ketik Tempat Belanja Baru..."
                />
              </div>
              {newPurchaseVendor && newPurchaseVendor.id !== "pending" && (
                <UpdatePurchaseVendorHiddenForm
                  newPurchaseVendorId={newPurchaseVendor.id}
                  onSuccess={() => {
                    setNewPurchaseVendor(null);
                    close();
                  }}
                  purchaseId={purchaseId}
                />
              )}
            </div>
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
}
