"use client";
import { Suspense, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DateTime } from "luxon";
import { toast } from "react-toastify";
import clsx from "clsx";
import { ImSpinner5 } from "react-icons/im";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import { useServerAction } from "@/presentation/hooks/useServerAction";

import { ItemOnCartCard } from "../_presentation/ItemOnCartCard";
import MakePurchaseHiddenForm from "./MakePurchaseHiddenForm";
import DatePicker from "./DatePicker";
import useCartManager from "./_hooks/useCartManager";
import { createPurchaseAction } from "../_action/createPurchase.action";

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
  const [minimizeCart, setMinimizeCart] = useState<boolean>(true);

  const cartRef = useRef<HTMLDivElement>(null);

  function selectVendor(data: Vendor | null) {
    setSelectedVendor(data);
  }

  function resetAll() {
    setSelectedVendor(null);
    setResizedImage(null);
    resetCart();
  }

  function scrollToView() {
    if (!cartRef.current) return;
    cartRef.current.scrollTo({
      top: cartRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  function appendItemOnCartWrapper(
    item: CreatePurchaseItemWithName
  ): string | undefined {
    const error = appendItemToCart(item);
    if (!error) setTimeout(scrollToView, 200);
    return error;
  }

  const [createPurchaseWrappedAction, isCreatePurchasePending] =
    useServerAction(
      createPurchaseAction,
      (msg, data) => {
        toast.success(SuccessMessage, {
          data,
          autoClose: 5000,
        });
        resetAll();
      },
      (err) => toast.error(err)
    );

  return (
    <div className="relative flex flex-col p-0.5 lg:p-2 pt-2 gap-2 w-full max-w-md lg:max-w-screen mx-auto bg-black h-full lg:h-screen lg:flex-row lg:max-h-screen">
      {isCreatePurchasePending && <SavePurchasePendingOverlay />}

      {/* Image Section */}
      <div className="flex flex-col basis-1/3 gap-3 h-full">
        <Suspense fallback={<LoadingSpinner />} data-comment="Image Selector">
          <ImageSelector
            resizedFile={resizedImage}
            setResizedFile={setResizedImage}
          />
        </Suspense>
      </div>

      {/* Cart Section */}
      <div
        data-comment="cart container"
        className="flex flex-col gap-3 basis-1/3"
      >
        {itemsCart.length === 0 && <EmptyPurchaseCart />}

        {itemsCart.length > 0 && (
          <div
            ref={cartRef}
            className={clsx(
              "flex flex-col font-mono bg-gray-800/50 lg:h-full w-full max-w-md mx-auto lg:max-h-full overflow-y-scroll flex-1",
              minimizeCart && "max-h-40"
            )}
            onMouseLeave={() => itemOnCartClickHandler("")}
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
        )}

        <div
          data-comment="cart bottom info container"
          className="sticky bottom-0 flex flex-col gap-2 mb-3 text-base/tight "
        >
          <div className="w-full flex flex-row gap-2 items-center justify-end">
            <button
              className={clsx(
                `text-xs w-full border border-white flex flex-row items-center justify-center gap-5 mr-6 lg:hidden`,
                itemsCart.length < 4 && "hidden"
              )}
              onClick={() => setMinimizeCart((prev) => !prev)}
            >
              {minimizeCart ? (
                <>
                  <MdExpandMore /> Expand Cart
                  <MdExpandMore />
                </>
              ) : (
                <>
                  <MdExpandLess />
                  Minimize Cart
                  <MdExpandLess />
                </>
              )}
            </button>
            <div className="flex flex-row gap-2 lg:text-xl">
              <div>Total</div>
              <h4 className=" font-black font-mono border border-gray-700 px-2 w-fit bg-blue-800">
                {formatNumberToIDR(cartTotalPrice)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Item input section */}
      <div
        data-comment="input-container"
        className="flex flex-col items-center gap-3 w-full basis-1/3"
      >
        <div className="hidden lg:inline font-bold">
          Tambah Item Ke Keranjang
        </div>
        <Suspense fallback={<LoadingSpinner />}>
          <ComboItemForm
            initialItems={initialItems}
            appendItemOnCart={appendItemOnCartWrapper}
          />
        </Suspense>

        {/* Vendor and Date Section */}
        <div className="hidden lg:inline font-bold">
          Lokasi dan waktu transaksi
        </div>
        <div className="flex flex-row gap-1 items-center w-full">
          <Suspense fallback={<LoadingSpinner />}>
            <ComboVendorForm
              initialVendors={initialVendors}
              selectedVendor={selectedVendor}
              selectVendor={selectVendor}
            />
          </Suspense>
          <div>@</div>
          <DatePicker txDate={txDate} setTxDate={setTxDate} />
        </div>

        <MakePurchaseHiddenForm
          purchasedAt={txDate}
          vendorId={selectedVendor ? selectedVendor.id : null}
          listOfPurchaseItem={itemsCart}
          totalPurchase={cartTotalPrice}
          image={resizedImage}
          clearFrom={resetAll}
          formAction={createPurchaseWrappedAction}
        />
        <button
          tabIndex={-1}
          onClick={() => resetAll()}
          className="underline cursor-pointer"
        >
          Reset All
        </button>
      </div>
    </div>
  );
}

function EmptyPurchaseCart() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full italic text-center text-sm text-gray-600 border border-gray-600/50 p-3">
      Transaksi kosong...
    </div>
  );
}

function SavePurchasePendingOverlay() {
  return (
    <div className="absolute top-0 bg-black/70 h-full w-full text-sm italic z-10 ">
      <div className=" animate-pulse flex-col flex h-full w-full items-center justify-center">
        <ImSpinner5 className="animate-spin text-5xl/tight mb-4" />
        <div>Menyimpan pembelian ke server.</div>
        <div>Mohon tunggu...</div>
      </div>
    </div>
  );
}

function SuccessMessage({ data }: { data: string }) {
  return (
    <Link
      className="flex flex-col underline text-2xl"
      href={`/transaction/details/${data}`}
    >
      <p>Sukses! Lihat transaksi</p>
    </Link>
  );
}

function LoadingSpinner() {
  return <ImSpinner5 className="animate-spin text-3xl/tight mb-4" />;
}
