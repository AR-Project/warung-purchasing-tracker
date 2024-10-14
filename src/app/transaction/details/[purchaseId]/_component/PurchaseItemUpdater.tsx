"use client";

import { Suspense, useState } from "react";
import { ImCancelCircle } from "react-icons/im";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

import ComboItemForm from "@/app/create/_component/ComboItemForm";
import { ItemCard } from "@/app/create/_presentation/ItemOnCartCard";
import { useForm } from "@/presentation/hooks/useForm";
import { updatePurchaseItemAction } from "../edit/_action/updatePurchaseItem.action";
import UpdatePurchaseItemForm from "../edit/_hiddenForm/UpdatePurchaseItemForm";

type Props = {
  purchaseId: string;
};

export default function PurchaseItemUpdater({ purchaseId }: Props) {
  // State for Item Editor
  const [itemsOnCart, setItemOnCart] = useState<PurchasedItem[]>([]);
  const [selectedItemOnCart, setSelectedItemOnCart] = useState<string>("");

  const isCartEmpty = itemsOnCart.length === 0;

  function appendItemOnCart(item: PurchasedItem) {
    const isAlreadyAdded =
      itemsOnCart.filter((addedItem) => addedItem.itemId == item.itemId)
        .length > 0;

    if (isAlreadyAdded) return { error: "Tambahkan item lain" };
    setItemOnCart((prevItems) => [...prevItems, item]);
  }

  function deleteItemOnCart(itemIndex: number) {
    setItemOnCart((prevItems) =>
      [...prevItems].filter((_, index) => index != itemIndex)
    );
  }

  function itemOnCartClickHandler(itemId: string) {
    setSelectedItemOnCart((prev) => {
      return prev == itemId ? "" : itemId;
    });
  }

  function updateItemOnCart(updatedItem: PurchasedItem, index: number) {
    setItemOnCart((prevItemsList) => {
      const newList = [...prevItemsList];
      newList[index] = updatedItem;
      return newList;
    });
  }

  // State for Dialog
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);

  function openDialogBox() {
    setIsDialogueOpen(true);
  }

  function closeDialogBox() {
    setItemOnCart([]);
    setIsDialogueOpen(false);
  }

  // Offscreen form

  const [formAction] = useForm(
    updatePurchaseItemAction,
    (msg, data) => {
      setItemOnCart([]);
      closeDialogBox();
      toast.success(msg);
    },
    (err) => {
      toast.error(err, { autoClose: 0 });
    }
  );

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
                {itemsOnCart.map((item, index) => (
                  <ItemCard
                    key={item.itemId}
                    onClick={itemOnCartClickHandler}
                    isActive={selectedItemOnCart == item.itemId}
                    item={item}
                    index={index}
                    deleteItem={deleteItemOnCart}
                    editPurchasedItem={updateItemOnCart}
                  />
                ))}
              </div>
            )}

            <Suspense fallback={<h1>Loading editor...</h1>}>
              <ComboItemForm appendItemOnCart={appendItemOnCart} />
            </Suspense>

            <div className="mt-4 flex flex-row w-full items-end gap-2">
              <UpdatePurchaseItemForm
                onSuccess={() => {
                  setItemOnCart([]);
                  closeDialogBox();
                }}
                purchaseId={purchaseId}
                purchaseItems={itemsOnCart}
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
