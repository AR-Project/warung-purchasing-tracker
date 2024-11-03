"use client";
import { Suspense, useRef, useState } from "react";
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
  const [txDate, setTxDate] = useState<string>("");
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
    setTimeout(scrollToView, 200);
    return result;
  }

  return (
    <div className="flex flex-col p-0.5 pt-2 gap-3 w-full max-w-[700px] mx-auto">
      <DatePicker txDate={txDate} setTxDate={setTxDate} />

      <Suspense fallback={<span>loading...</span>}>
        <ComboVendorForm
          initialVendors={initialVendors}
          selectedVendor={selectedVendor}
          selectVendor={selectVendor}
        />
      </Suspense>

      <Suspense fallback={<span>loading...</span>}>
        <ImageSelector
          resizedFile={resizedImage}
          setResizedFile={setResizedImage}
        />
      </Suspense>

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
            className="max-h-64 overflow-y-scroll flex flex-col font-mono bg-gray-800/50 mb-2"
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
          {itemsCart.length > 5 && (
            <div className="absolute bg-gradient-to-t from-black to-transparent w-full h-5 bottom-0 pointer-events-none border-b border-gray-500"></div>
          )}
        </div>
      )}

      <h4 className="text-xl font-black text-center border border-gray-700 p-2">
        {formatNumberToIDR(cartTotalPrice)}
      </h4>
      <Suspense fallback={<span>loading...</span>}>
        <ComboItemForm
          initialItems={initialItems}
          appendItemOnCart={appendItemOnCartWrapper}
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
