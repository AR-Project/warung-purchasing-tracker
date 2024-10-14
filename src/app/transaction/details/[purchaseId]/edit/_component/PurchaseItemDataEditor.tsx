"use client";

/**
 * NEED REWORK
 */

import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { MdEdit } from "react-icons/md";
import UpdatePurchaseItemDataForm from "../_hiddenForm/UpdatePurchaseItemDataForm";

type Props = {
  purchaseId: string;
  purchasedItem: PurchasedItemsEditor;
};

export default function PurchaseItemDataEditor({
  purchasedItem,
  purchaseId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(
    purchasedItem.quantityInHundreds / 100
  );
  const [price, setPrice] = useState<number>(purchasedItem.pricePerUnit);

  function closePanel() {
    setIsOpen(false);
  }
  return (
    <>
      <button
        className={`rounded-sm bg-blue-800 h-10 aspect-square flex flex-row items-center justify-center text-lg font-medium  focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-200 data-[hover]:text-gray-100`}
        onClick={() => setIsOpen(true)}
      >
        <MdEdit />{" "}
      </button>
      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } fixed inset-0 w-screen items-center justify-center p-4 z-10 bg-black/70`}
      >
        <div className="max-w-lg space-y-4 border bg-black p-12 z-20">
          <h1>{purchasedItem.name}</h1>
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

          <UpdatePurchaseItemDataForm
            purchaseId={purchaseId}
            purchaseItemId={purchasedItem.id}
            updatedPricePerUnit={price}
            updatedQuantityInHundred={quantity * 100}
            onSuccess={() => closePanel()}
          />
          <button onClick={() => closePanel()}>cancel</button>
        </div>
      </div>
    </>
  );
}
