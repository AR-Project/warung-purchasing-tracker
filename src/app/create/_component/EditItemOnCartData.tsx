"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { ImCancelCircle, ImCheckmark } from "react-icons/im";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

type Props = {
  updateItem: (updatedItem: PurchasedItem, index: number) => void;
  purchasedItem: PurchasedItem;
  itemIndex: number;
};

export default function EditItemDataOnCart({
  itemIndex,
  purchasedItem,
  updateItem,
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

  function openDialogBox() {
    setIsOpen(true);
  }

  function closeDialogBox() {
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

    updateItem(
      {
        ...currentPurchasedItem,
        quantityInHundreds: finalQuantityInHundreds,
        pricePerUnit: finalPricePerUnit,
        totalPrice: parseInt(totalPrice()),
      },
      itemIndex
    );
    toast.success("Item diperbarui");
    closeDialogBox();
  };

  return (
    <>
      <Button
        onClick={openDialogBox}
        className="rounded-md bg-gray-800 h-10 aspect-square flex flex-row items-center justify-center text-sm font-medium  focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-400 data-[hover]:text-gray-100"
        tabIndex={-1}
      >
        <FiEdit />
      </Button>
      <Dialog
        open={isOpen}
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
              <form className="flex flex-col gap-0.5">
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
                          setQuantity(
                            values.floatValue ? values.floatValue : ""
                          );
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
                  <Button
                    onClick={finalizeEdit}
                    className=" flex flex-row gap-2 p-2 items-center bg-green-900 border border-gray-500 rounded-md  w-fit hover:bg-green-800"
                  >
                    <ImCheckmark className="text-xl" /> Ganti
                  </Button>
                  <Button
                    className="BTN-CANCEL flex flex-row gap-2 p-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
                    onClick={closeDialogBox}
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
