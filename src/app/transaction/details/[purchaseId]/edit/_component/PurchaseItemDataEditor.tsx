"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { MdEdit, MdKeyboardDoubleArrowRight } from "react-icons/md";

import UpdatePurchaseItemDataForm from "../_hiddenForm/UpdatePurchaseItemDataForm";
import { formatNumberToIDR } from "@/lib/utils/formatter";

type Props = {
  purchaseId: string;
  purchasedItem: PurchaseItemToEdit;
};

export default function PurchaseItemDataEditor(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function closePanel() {
    setIsOpen(false);
  }
  return (
    <>
      <Button
        className={`rounded-sm bg-blue-800 h-10 aspect-square flex flex-row items-center justify-center text-lg font-medium  focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-200 data-[hover]:text-gray-100`}
        onClick={() => setIsOpen(true)}
      >
        <MdEdit />{" "}
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closePanel}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <EditorPanel {...props} closePanel={closePanel} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

type EditorPanelProps = Props & {
  closePanel: () => void;
};

function EditorPanel({
  purchasedItem,
  purchaseId,
  closePanel,
}: EditorPanelProps) {
  const [quantity, setQuantity] = useState<number>(
    purchasedItem.quantityInHundreds / 100
  );
  const [price, setPrice] = useState<number>(purchasedItem.pricePerUnit);

  return (
    <DialogPanel
      transition
      className="w-full max-w-md rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 flex flex-col gap-1"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Ubah Data Pembelian Item
      </DialogTitle>
      <div className="text-white/80">{purchasedItem.name}</div>
      <div className="flex flex-col gap-2 py-6">
        <div className="flex flex-row w-full items-center">
          <div className="w-full">
            <p className="text-sm/7 italic text-gray-400">Jumlah Sebelum</p>
            <label
              htmlFor="updated-quantity-inhundred"
              className="flex w-full justify-between items-center flex-row border border-white/10 h-10 px-3 text-white/50 italic"
            >
              {purchasedItem.quantityInHundreds / 100}
            </label>
          </div>
          <div className="px-2">
            <MdKeyboardDoubleArrowRight className="text-3xl translate-y-3" />
          </div>
          <div className="w-full">
            <p className="text-sm/7 text-gray-100">Jumlah</p>
            <input
              type="number"
              id="updated-quantity-inhundred"
              className="bg-black text-white border border-white/30 h-10 px-3 w-full"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              value={quantity}
              required
            />
          </div>
        </div>

        <div className="flex flex-row w-full items-center">
          <div className="w-full">
            <p className="text-sm/7 italic text-gray-400">
              Harga Satuan Sebelum
            </p>
            <label
              htmlFor="updated-price-per-unit"
              className="flex w-full justify-between items-center flex-row border border-white/10 h-10 px-3 text-white/50 italic"
            >
              {formatNumberToIDR(purchasedItem.pricePerUnit)}
            </label>
          </div>
          <div className="px-2">
            <MdKeyboardDoubleArrowRight className="text-3xl translate-y-3" />
          </div>
          <div className="w-full">
            <p className="text-sm/7 text-gray-200">Harga Satuan</p>
            <NumericFormat
              name="updated-price-per-unit"
              id="updated-price-per-unit"
              className="bg-black text-white border border-white/30 h-10 px-3 w-full"
              value={price}
              prefix="Rp"
              thousandSeparator="."
              decimalSeparator=","
              placeholder="Harga satuan"
              onValueChange={(values) => {
                setPrice(values.floatValue ? values.floatValue : 0);
              }}
            />
          </div>
        </div>

        <div className="flex flex-row w-full items-center">
          <div className="w-full">
            <p className="text-sm/7 italic text-gray-400">
              Total Harga Sebelum
            </p>
            <div className="flex w-full justify-between items-center flex-row border border-white/10 h-10 px-3 text-white/50 italic">
              {formatNumberToIDR(
                (purchasedItem.pricePerUnit *
                  purchasedItem.quantityInHundreds) /
                  100
              )}
            </div>
          </div>
          <div className="px-2">
            <MdKeyboardDoubleArrowRight className="text-3xl translate-y-3" />
          </div>
          <div className="w-full">
            <p className="text-sm/7 text-gray-300 italic">Total Harga</p>
            <div className="bg-gray-900 text-white/70 italic cursor-not-allowed border border-white/20 h-10 px-3 w-full flex flex-row items-center">
              {formatNumberToIDR(price * quantity)}
            </div>
          </div>
        </div>
      </div>

      <div className=" flex flex-row gap-3">
        <UpdatePurchaseItemDataForm
          purchaseId={purchaseId}
          purchaseItemId={purchasedItem.id}
          updatedPricePerUnit={price}
          updatedQuantityInHundred={quantity * 100}
          onSuccess={() => closePanel()}
        />
        <button
          className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-red-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={() => closePanel()}
        >
          cancel
        </button>
      </div>
    </DialogPanel>
  );
}
