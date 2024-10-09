"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { ImCancelCircle, ImCheckmark } from "react-icons/im";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { EditorType } from "./PurchaseEditor";
import { MdEdit, MdSave } from "react-icons/md";
import { useForm } from "@/presentation/hooks/useForm";
import { editDataSingleItem } from "../_action/editDataSingleItem.action";
import ItemDataForm from "../_hiddenForm/ItemDataForm";

type Props = {
  purchaseId: string;
  purchasedItem: PurchasedItemsEditor;
  activeEditor: EditorType | null;
  // formAction: (payload: FormData) => void;
};

export default function ItemDataEditorAlt({
  purchasedItem,
  activeEditor,
  purchaseId,
}: // formAction,
Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(
    purchasedItem.quantityInHundreds / 100
  );
  const [price, setPrice] = useState<number>(purchasedItem.pricePerUnit);

  const isItemDataEditorActive = activeEditor === "edit-data-item";

  function closePanel() {
    setIsOpen(false);
  }
  const [formAction] = useForm(
    editDataSingleItem,
    (msg) => {
      toast.success(msg, { autoClose: 50 });
      closePanel();
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <>
      <button
        className={`transition-transform ease-in-out duration-100 absolute right-0 top-1/2 -translate-y-1/2 ${
          isItemDataEditorActive ? "translate-x-[0%]" : "translate-x-[100%]"
        }
         rounded-sm bg-blue-800 h-10 aspect-square flex flex-row items-center justify-center text-lg font-medium  focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-200 data-[hover]:text-gray-100`}
        onClick={() => setIsOpen(true)}
      >
        <MdEdit />{" "}
      </button>
      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } fixed inset-0 w-screen items-center justify-center p-4 z-10 bg-black/70`}
        onClick={() => console.log(`Hello ${Date.now()}`)}
      >
        <div className="max-w-lg space-y-4 border bg-black p-12 z-20">
          <h1>{purchasedItem.name}</h1>
          <form action={formAction} className="flex flex-col">
            <input
              type="hidden"
              id="purchase-id"
              name="purchase-id"
              value={purchaseId}
            />
            <input
              type="hidden"
              name="purchase-item-id"
              id="purchase-item-id"
              value={purchasedItem.id}
            />
            <label htmlFor="updated-quantity-inhundred">
              Jumlah dalam Ratusan {quantity * 100}
            </label>
            <input
              type="number"
              className="bg-black text-white border"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              value={quantity}
              required
            />
            <input
              type="hidden"
              name="updated-quantity-in-hundred"
              id="updated-quantity-in-hundred"
              value={quantity * 100}
            />
            <label htmlFor="updated-price-per-unit">Harga Satuan{price}</label>
            <input
              type="hidden"
              name="updated-price-per-unit"
              id="updated-price-per-unit"
              value={price}
            />
            <NumericFormat
              name="updated-price-per-unit"
              id="updated-price-per-unit"
              className="bg-gray-800 border w-full border-gray-500 p-1 rounded-sm"
              value={price}
              prefix="Rp"
              thousandSeparator="."
              decimalSeparator=","
              placeholder="Harga satuan"
              onValueChange={(values) => {
                setPrice(values.floatValue ? values.floatValue : 0);
              }}
            />
            <button
              type="submit"
              className=" rounded-md  border border-gray-600 bg-blue-800 h-10 gap-2 px-2 flex flex-row justify-center items-center hover:bg-blue-600 disabled:cursor-not-allowed"
              disabled={
                purchasedItem.quantityInHundreds / 100 === quantity &&
                purchasedItem.pricePerUnit === price
              }
            >
              <MdSave className="text-xl" /> Simpan
            </button>
            <button onClick={() => closePanel()}>cancel</button>
          </form>
        </div>
      </div>
    </>
  );
}
