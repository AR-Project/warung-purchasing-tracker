"use client";

import { Suspense, useState } from "react";
import { ImCancelCircle } from "react-icons/im";
import { FaPlus } from "react-icons/fa";

import ComboItemForm from "@/app/create/_component/ComboItemForm";
import { ItemOnCartCard } from "@/app/create/_presentation/ItemOnCartCard";
import UpdatePurchaseItemForm from "../_hiddenForm/UpdatePurchaseItemForm";
import useCartManager from "@/app/create/_component/_hooks/useCartManager";

type Props = {
  purchaseId: string;
  initialItems: { id: string; name: string }[];
  purchaseItems: PurchaseItemDisplay[];
};

export default function PurchaseItemUpdater({
  purchaseId,
  initialItems,
  purchaseItems,
}: Props) {
  const itemIdAlreadyExist = purchaseItems.map(
    (purchaseItem) => purchaseItem.itemId
  );

  const {
    itemsCart,
    activeItemOnCart,
    cartTotalPrice,
    appendItemToCart,
    updateItemOnCart,
    deleteItemOnCart,
    itemOnCartClickHandler,
    resetCart,
  } = useCartManager(itemIdAlreadyExist);

  const isCartEmpty = itemsCart.length === 0;

  const [isDialogueOpen, setIsDialogueOpen] = useState(false);

  function openDialogBox() {
    setIsDialogueOpen(true);
  }

  function closeDialogBox() {
    resetCart();
    setIsDialogueOpen(false);
  }

  return (
    <>
      <button
        onClick={openDialogBox}
        className="rounded-sm bg-blue-800 h-8 border border-gray-500 px-2 flex flex-row items-center justify-center  focus:outline-none data-[hover]:border data-[hover]:border-white data-[focus]:outline-1 data-[focus]:outline-white text-gray-200 data-[hover]:text-gray-100"
      >
        <FaPlus className="text-lg pr-2" />
        Add More Item
      </button>
      <div
        className={`${
          isDialogueOpen ? "flex" : "hidden"
        } fixed inset-0 w-screen items-center justify-center p-4 z-10 bg-black/70`}
      >
        {" "}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-700 p-6  flex flex-col gap-2">
            <div className="text-xl font-bold text-white mb-5">
              Tambah Produk
            </div>
            {isCartEmpty && (
              <span className="w-full h-full italic text-center text-sm text-gray-300 border border-gray-300/50 p-3">
                Belum ada item yang ditambahkan...
              </span>
            )}

            {!isCartEmpty && (
              <div className="max-h-64 overflow-y-scroll flex flex-col font-mono">
                {itemsCart.map((item, index) => (
                  <ItemOnCartCard
                    key={item.itemId}
                    onClick={itemOnCartClickHandler}
                    isActive={activeItemOnCart == item.itemId}
                    item={item}
                    index={index}
                    deleteItem={deleteItemOnCart}
                    editPurchasedItem={updateItemOnCart}
                  />
                ))}
              </div>
            )}

            <Suspense fallback={<h1>Loading editor...</h1>}>
              <ComboItemForm
                initialItems={initialItems}
                appendItemOnCart={appendItemToCart}
              />
            </Suspense>

            <div className="mt-4 flex flex-row w-full items-end gap-2">
              <UpdatePurchaseItemForm
                onSuccess={() => {
                  resetCart();
                  closeDialogBox();
                }}
                purchaseId={purchaseId}
                payload={itemsCart}
              />
              <button
                className="BTN-CANCEL flex flex-row gap-2 h-10 px-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
                onClick={closeDialogBox}
              >
                <ImCancelCircle className="text-xl text-gray-300" />{" "}
                {isCartEmpty ? "Tutup" : "Batalkan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
