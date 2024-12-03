"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import PurchaseItemDisplayer from "@/app/_component/PurchaseItemDisplayer";
import { MdShoppingCart } from "react-icons/md";
import { formatNumberToIDR } from "@/lib/utils/formatter";
import clsx from "clsx";
import { af } from "vitest/dist/chunks/reporters.C4ZHgdxQ.js";
import {
  ListOfPlanItemInput,
  savePlanAction,
} from "../_action/savePlan.action";

type Props = {
  purchaseItems: PurchaseItemDisplay[];
  totalPrice: number;
};

export default function PlanCartDialog(props: Props) {
  let [isOpen, setIsOpen] = useState(false);
  const [effect, setEffect] = useState(false);

  function open() {
    if (props.totalPrice === 0) {
      setEffect(true);
      return;
    }
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className={clsx(
          `transition-colors ease-in-out duration-300  z-20  h-12 px-3 rounded-full flex flex-row gap-2 items-center`,
          effect && "animate-shake bg-red-700",
          !effect && "bg-blue-700"
        )}
        onAnimationEnd={() => setEffect(false)}
      >
        {formatNumberToIDR(props.totalPrice)}
        <MdShoppingCart />
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Panel {...props} closeDialog={close} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

type PanelProps = Props & {
  closeDialog: () => void;
  purchaseItems: PurchaseItemDisplay[];
  totalPrice: number;
};

function Panel({ closeDialog, purchaseItems, totalPrice }: PanelProps) {
  const router = useRouter();

  const [formAction, isPending] = useServerAction(
    savePlanAction,
    (msg) => {
      toast.success(msg);
      setTimeout(() => router.push("/plan/"), 1500);
    },
    (err) => {
      toast.error(err);
    }
  );

  const planItemPayload: ListOfPlanItemInput = purchaseItems.map(
    ({ itemId, pricePerUnit, quantityInHundreds }) => ({
      itemId,
      pricePerUnit,
      quantityInHundreds,
      totalPrice: (pricePerUnit * quantityInHundreds) / 100,
    })
  );

  function onSaveHandler() {
    const form = new FormData();
    form.append("total-price", totalPrice.toString());
    form.append("plan-item-stringify", JSON.stringify(planItemPayload));
    formAction(form);
  }

  return (
    <DialogPanel
      transition
      className="w-full max-w-xs rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Keranjang
      </DialogTitle>
      <div className=" overflow-y-scroll">
        <PurchaseItemDisplayer
          purchaseItems={purchaseItems}
          totalPrice={totalPrice}
        />
      </div>
      <div className="mt-4 flex flex-row gap-3">
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={onSaveHandler}
        >
          Simpan Plan
        </Button>
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={closeDialog}
        >
          Edit lagi
        </Button>
      </div>
    </DialogPanel>
  );
}
