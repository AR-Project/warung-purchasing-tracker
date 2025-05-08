"use client";
import { Suspense, useRef, useState } from "react";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import { ItemOnCartCard } from "../_presentation/ItemOnCartCard";
import MakePurchaseHiddenForm from "./MakePurchaseHiddenForm";
import DatePicker from "./DatePicker";
import useCartManager from "./_hooks/useCartManager";

const ImageSelector = dynamic(() => import("./ImageSelector"));
const ComboItemForm = dynamic(() => import("./ComboItemForm"));
const ComboVendorForm = dynamic(() => import("./ComboVendorForm"));

type DataTemplate = { id: string; name: string };

type Props = {
  initialVendors: DataTemplate[];
  initialItems: DataTemplate[];
};

export default function PurchaseCreator({
  initialVendors,
  initialItems,
}: Props) {
  const {
    itemsCart,
    activeItemOnCart,
    cartTotalPrice,
    appendItemToCart,
    updateItemOnCart,
    deleteItemOnCart,
    resetCart,
    itemOnCartClickHandler,
  } = useCartManager();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [txDate, setTxDate] = useState<string>(DateTime.now().toISODate());
  const [resizedImage, setResizedImage] = useState<Blob | null>(null);

  const itemsContainerRef = useRef<HTMLDivElement>(null);

  function selectVendor(data: Vendor | null) {
    setSelectedVendor(data);
  }

  function resetAll() {
    setTxDate("");
    setSelectedVendor(null);
    setResizedImage(null);
    resetCart();
  }

  function scrollToView() {
    itemsContainerRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    return;
  }

  function appendItemOnCartWrapper(
    item: CreatePurchaseItemWithName
  ): string | undefined {
    const result = appendItemToCart(item);
    if (!result)
      toast.info(
        <div>
          `<span className="font-bold">{item.name}</span> masuk keranjang`
        </div>,
        {
          position: "top-center",
          autoClose: 2000,
        }
      );
    setTimeout(scrollToView, 200);
    return result;
  }

  return (
    <div className="flex flex-col p-0.5 pt-2 gap-3 w-full max-w-[700px] mx-auto">
      <div className="flex flex-row gap-1 items-center">
        <Suspense fallback={<span>loading...</span>}>
          <ComboVendorForm
            initialVendors={initialVendors}
            selectedVendor={selectedVendor}
            selectVendor={selectVendor}
          />
        </Suspense>
        <div>@</div>
        <DatePicker txDate={txDate} setTxDate={setTxDate} />
      </div>

      {itemsCart.length === 0 && (
        <span className="w-full h-full italic text-center text-sm text-gray-600 border border-gray-600/50 p-3">
          Transaksi kosong...
        </span>
      )}
      {itemsCart.length > 0 && (
        <div
          className="relative"
          onMouseLeave={() => itemOnCartClickHandler("")}
        >
          <div
            ref={itemsContainerRef}
            className="flex flex-col font-mono bg-gray-800/50 mb-2"
          >
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
        </div>
      )}
      <h4 className="text-xl font-black text-center border border-gray-700 p-2">
        {formatNumberToIDR(cartTotalPrice)}
      </h4>
      <Suspense fallback={<span>loading...</span>}>
        <div className="sticky bottom-0 bg-black/90 py-3">
          <ComboItemForm
            initialItems={initialItems}
            appendItemOnCart={appendItemOnCartWrapper}
          />
        </div>
      </Suspense>

      <Suspense fallback={<span>loading...</span>}>
        <ImageSelector
          resizedFile={resizedImage}
          setResizedFile={setResizedImage}
        />
      </Suspense>

      <MakePurchaseHiddenForm
        purchasedAt={txDate}
        vendorId={selectedVendor ? selectedVendor.id : null}
        listOfPurchaseItem={itemsCart}
        totalPurchase={cartTotalPrice}
        image={resizedImage}
        clearFrom={resetAll}
      />
      <button tabIndex={-1} onClick={() => resetAll()}>
        Reset
      </button>
    </div>
  );
}
