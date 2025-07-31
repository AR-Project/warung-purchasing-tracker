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
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { savePurchaseAction } from "../_action/savePurchase.action";
import { ImSpinner5 } from "react-icons/im";
import Link from "next/link";

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

  const [savePurchaseWrappedAction, isSavePurchaseActionPending] =
    useServerAction(
      savePurchaseAction,
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
    <div className="flex flex-col p-0.5 pt-2 gap-2 w-full max-w-md mx-auto bg-black h-full relative lg:max-w-screen lg:w-full lg:grid lg:grid-cols-3 lg:gap-8 lg:max-h-screen lg:h-screen">
      {isSavePurchaseActionPending && <SavePurchasePendingOverlay />}

      <Suspense
        fallback={<span>loading...</span>}
        data-comment="Image Selector"
      >
        <ImageSelector
          resizedFile={resizedImage}
          setResizedFile={setResizedImage}
        />
      </Suspense>

      <div
        data-comment="cart container"
        className="flex flex-col max-h-[70dvh] gap-3"
      >
        <div className="hidden lg:inline font-bold text-center">
          Keranjang Pembelian
        </div>
        {/* Cart Section */}
        {itemsCart.length === 0 && <EmptyPurchaseCart />}

        {itemsCart.length > 0 && (
          <div
            ref={cartRef}
            className={`flex flex-col font-mono bg-gray-800/50 lg:h-full  w-full max-w-md mx-auto clip lg:max-h-full overflow-y-scroll flex-1 ${
              minimizeCart && "max-h-40 lg:max-h-full overflow-y-scroll"
            }`}
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
        <div className="sticky bottom-0 flex flex-col gap-2 mb-3 text-base/tight ">
          <div className="w-full flex flex-row gap-2 items-center justify-end">
            <button
              className={`${
                itemsCart.length < 4 && "hidden"
              } text-xs w-full border border-white flex flex-row items-center justify-center gap-5 mr-6 lg:hidden`}
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
            <div>Total</div>
            <h4 className=" font-black font-mono border border-gray-700 px-2 w-fit bg-blue-800">
              {formatNumberToIDR(cartTotalPrice)}
            </h4>
          </div>
        </div>

        {/* Item input section */}
      </div>

      <div
        data-comment="input-container"
        className="flex flex-col items-center gap-3 w-full"
      >
        <div className="hidden lg:inline font-bold">
          Tambah Item Ke Keranjang
        </div>
        <Suspense fallback={<span>loading...</span>}>
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

        <MakePurchaseHiddenForm
          purchasedAt={txDate}
          vendorId={selectedVendor ? selectedVendor.id : null}
          listOfPurchaseItem={itemsCart}
          totalPurchase={cartTotalPrice}
          image={resizedImage}
          clearFrom={resetAll}
          formAction={savePurchaseWrappedAction}
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
    <div className="w-full h-full lg:h-96 italic text-center text-sm text-gray-600 border border-gray-600/50 p-3">
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
