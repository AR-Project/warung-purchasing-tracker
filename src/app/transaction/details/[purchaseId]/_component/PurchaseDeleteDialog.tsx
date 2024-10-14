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
import { deletePurchase } from "../edit/_action/deletePurchase.action";

type Props = {
  purchaseId: string;
};

export default function PurchaseDeleteDialog({ purchaseId }: Props) {
  let [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  const [formAction, isPending] = useServerAction(
    deletePurchase,
    (msg) => {
      toast.success(msg);
      setTimeout(() => router.push("/transaction/purchase"), 1500);
    },
    (err) => {
      toast.error(err);
    }
  );

  function onDeleteHandler() {
    const form = new FormData();
    form.append("purchase-id", purchaseId);
    formAction(form);
  }

  return (
    <>
      <Button
        onClick={open}
        className="h-8 border border-white/50 px-2 bg-red-950 rounded-sm text-white focus:outline-none data-[hover]:bg-red-800 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        Delete Current Purchase
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
        __demoMode
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Panel closeDialog={close} onDeleteHandler={onDeleteHandler} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

type PanelProps = {
  onDeleteHandler: () => void;
  closeDialog: () => void;
};

function Panel({ onDeleteHandler, closeDialog }: PanelProps) {
  return (
    <DialogPanel
      transition
      className="w-full max-w-xs rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Hapus transaksi secara permanen?
      </DialogTitle>
      <p className="mt-2 text-base/5 text-white/50">
        Transaksi yang telah dihapus akan hilang secara permanen dari database
        dan tidak bisa dikembalikan.
      </p>
      <div className="mt-4 flex flex-row gap-3">
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-red-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-red-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={onDeleteHandler}
        >
          Hapus Permanen
        </Button>
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={closeDialog}
        >
          Batal
        </Button>
      </div>
    </DialogPanel>
  );
}
