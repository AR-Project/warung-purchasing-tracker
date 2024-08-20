"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { ImCancelCircle, ImCheckmark } from "react-icons/im";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

type Props = {
  editPurchasedItem: (updatedItem: PurchasedItem, index: number) => void;
  purchasedItem: PurchasedItem;
  itemIndex: number;
};

export default function EditActivePurchasedItem({
  itemIndex,
  purchasedItem,
  editPurchasedItem,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPurchasedItem, setCurrentPurchasedItem] =
    useState<PurchasedItem>(purchasedItem);
  const [quantity, setQuantity] = useState<number | "">(
    currentPurchasedItem.quantityInHundreds / 100
  );
  const [price, setPrice] = useState<number | "">(
    currentPurchasedItem.pricePerUnit
  );

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  const totalPrice = () => {
    if (typeof price == "number" && typeof quantity == "number") {
      return (price * quantity).toString();
    }
    return "0";
  };

  const finalizeEdit = () => {
    const finalQuantityInHundreds =
      typeof quantity === "number" ? quantity * 100 : 0;
    const finalPricePerUnit = typeof price === "number" ? price : 0;

    editPurchasedItem(
      {
        ...currentPurchasedItem,
        quantityInHundreds: finalQuantityInHundreds,
        pricePerUnit: finalPricePerUnit,
        totalPrice: parseInt(totalPrice()),
      },
      itemIndex
    );
    toast.success("Item diperbarui");
    close();
  };

  return (
    <>
      <Button
        onClick={open}
        className="rounded-md bg-gray-800 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-black/30 data-[focus]:outline-1 data-[focus]:outline-white"
        tabIndex={-1}
      >
        <FiEdit className="text-gray-400" />
      </Button>
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <form className="flex flex-col gap-0.5">
                <DialogTitle
                  as="h3"
                  className="text-base/7 font-medium text-white"
                >
                  {purchasedItem.name}
                </DialogTitle>
                <div className="grid grid-cols-3 gap-1 items-center">
                  <NumericFormat
                    className="bg-gray-800 border border-gray-500 p-1 rounded-sm"
                    value={quantity}
                    thousandSeparator=" "
                    decimalSeparator=","
                    decimalScale={2}
                    placeholder="Jumlah"
                    onValueChange={(values) => {
                      setQuantity(values.floatValue ? values.floatValue : "");
                    }}
                  />
                  <NumericFormat
                    className="bg-gray-800 border border-gray-500 p-1 rounded-sm"
                    value={price}
                    prefix="Rp"
                    thousandSeparator="."
                    decimalSeparator=","
                    placeholder="Harga satuan"
                    onValueChange={(values) => {
                      setPrice(values.floatValue ? values.floatValue : "");
                    }}
                  />
                  <input
                    type="text"
                    className="bg-gray-900 border border-gray-700 p-1 text-gray-400 font-bold rounded-sm"
                    name="total-price"
                    value={formatNumberToIDR(parseInt(totalPrice()))}
                    id="purchased-item-total-price"
                    disabled
                  />
                </div>
                <div className="mt-4 flex flex-row w-full items-end gap-2">
                  <Button
                    onClick={finalizeEdit}
                    className=" flex flex-row gap-2 p-2 items-center bg-green-900 border border-gray-500 rounded-md  w-fit hover:bg-green-800"
                  >
                    <ImCheckmark className="text-xl" /> Ganti
                  </Button>
                  <Button
                    className="BTN-CANCEL flex flex-row gap-2 p-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
                    onClick={close}
                  >
                    <ImCancelCircle className="text-xl text-gray-300" /> Batal
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
