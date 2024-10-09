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
import { MdEdit } from "react-icons/md";
import { useForm } from "@/presentation/hooks/useForm";
import { editDataSingleItem } from "../_action/editDataSingleItem.action";
import ItemDataForm from "../_hiddenForm/ItemDataForm";

type Props = {
  purchaseId: string;
  purchasedItem: PurchasedItemsEditor;
  activeEditor: EditorType | null;
  formAction: (payload: FormData) => void;
};

export default function ItemDataEditor({
  purchasedItem,
  activeEditor,
  purchaseId,
  formAction,
}: Props) {
  const isItemDataEditorActive = activeEditor === "edit-data-item";

  const [isDialogueOpen, setIsDialogueOpen] = useState(false);

  const [quantity, setQuantity] = useState<number | "">(
    purchasedItem.quantityInHundreds / 100
  );

  const [price, setPrice] = useState<number | "">(purchasedItem.pricePerUnit);

  function openDialogBox() {
    setIsDialogueOpen(true);
  }

  function closeDialogBox() {
    setIsDialogueOpen(false);
  }

  const totalPrice = () => {
    if (typeof price == "number" && typeof quantity == "number") {
      return (price * quantity).toString();
    }
    return "0";
  };

  return (
    <>
      <Button
        onClick={openDialogBox}
        className={`transition-transform ease-in-out duration-100 absolute right-0 top-1/2 -translate-y-1/2 ${
          isItemDataEditorActive ? "translate-x-[0%]" : "translate-x-[100%]"
        }
         rounded-sm bg-blue-800 h-10 aspect-square flex flex-row items-center justify-center text-lg font-medium  focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-200 data-[hover]:text-gray-100`}
      >
        <MdEdit />
      </Button>
      <Dialog
        open={isDialogueOpen}
        as="div"
        className="absolute z-10 focus:outline-none"
        onClose={closeDialogBox}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="fixed top-0 inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-gray-700 p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-xl font-bold text-white mb-5"
              >
                Ubah Jumlah - {purchasedItem.name}
              </DialogTitle>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-5">
                  <div className="flex flex-col">
                    <label className="text-sm" htmlFor="edit-item-quantity">
                      Jumlah Barang
                    </label>
                    <NumericFormat
                      className="bg-gray-800 border w-full border-gray-500 p-1 rounded-sm"
                      id="edit-item-quantity"
                      value={quantity}
                      thousandSeparator=" "
                      decimalSeparator=","
                      decimalScale={2}
                      placeholder="Jumlah"
                      onValueChange={(values) => {
                        setQuantity(values.floatValue ? values.floatValue : "");
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm" htmlFor="edit-item-unit-price">
                      Harga Satuan
                    </label>
                    <NumericFormat
                      id="edit-item-unit-price"
                      className="bg-gray-800 border w-full border-gray-500 p-1 rounded-sm"
                      value={price}
                      prefix="Rp"
                      thousandSeparator="."
                      decimalSeparator=","
                      placeholder="Harga satuan"
                      onValueChange={(values) => {
                        setPrice(values.floatValue ? values.floatValue : "");
                      }}
                    />
                  </div>
                </div>
                <label
                  className="text-sm"
                  htmlFor="edit-purchased-item-total-price"
                >
                  Total Harga
                </label>
                <input
                  type="text"
                  className="bg-gray-900 border border-gray-700 p-1 text-gray-400 font-bold rounded-sm"
                  name="total-price"
                  value={formatNumberToIDR(parseInt(totalPrice()))}
                  id="edit-purchased-item-total-price"
                  disabled
                />
              </div>
              <div className="mt-4 flex flex-row w-full items-end gap-2">
                <ItemDataForm
                  formAction={formAction}
                  purchaseId={purchaseId}
                  purchaseItemId={purchasedItem.id}
                  updatedPricePerUnit={price}
                  updatedQuantityInHundred={
                    typeof quantity === "number" ? quantity * 100 : 0
                  }
                />
                <Button
                  className="BTN-CANCEL flex flex-row gap-2 h-10 px-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
                  onClick={closeDialogBox}
                >
                  <ImCancelCircle className="text-xl text-gray-300" /> Batal
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
