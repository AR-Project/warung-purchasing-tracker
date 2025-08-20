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
import { usePathname } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";

import { updateItemImageAction } from "@/app/_globalAction/item/updateItemImage.action";
import SimpleImageSelector from "./hooks/SimpleImageSelector";
import { RxCross2 } from "react-icons/rx";

type Props = {
  itemId: string;
};

/**
 * MODAL TRIGGER
 */

export default function UpdateItemImageModal(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={openModal}
        className="h-8 border border-white/50 px-2 bg-green-950 rounded-sm text-white focus:outline-none data-[hover]:bg-green-800 data-[focus]:outline-1 data-[focus]:outline-white flex flex-row gap-2 justify-center items-center"
      >
        Ubah Gambar
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closeModal}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Panel closeDialog={closeModal} {...props} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

/**
 * INTERNAL MODAL
 */

type PanelProps = Props & {
  closeDialog: () => void;
};

function Panel({ closeDialog, itemId }: PanelProps) {
  const currentPath = usePathname();

  const [wrappedAction, isPending] = useServerAction(
    updateItemImageAction,
    (msg, err) => {
      toast.success("Image changed");
      closeDialog();
    },
    (err) => {
      toast.error(err);
    }
  );

  const [resizedFile, setResizedFile] = useState<Blob | null>(null);

  function interceptAction(formData: FormData): void {
    if (!resizedFile) return;
    formData.set("image-blob", resizedFile, "from-manage-item");
    setResizedFile(null);
    wrappedAction(formData);
  }

  return (
    <DialogPanel
      transition
      className="w-full max-w-xs rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white text-center">
        Ganti Gambar Item
      </DialogTitle>
      <SimpleImageSelector
        resizedFile={resizedFile}
        setResizedFile={(blob) => setResizedFile(blob)}
      />
      <form
        action={interceptAction}
        className="flex flex-row w-full justify-between"
      >
        <input type="hidden" name="path-to-revalidate" value={currentPath} />
        <input type="hidden" name="item-id" value={itemId} />
        <Button
          className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          onClick={closeDialog}
        >
          <RxCross2 />
          Batal
        </Button>
        <Button
          type="submit"
          className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={resizedFile === null || isPending}
        >
          {isPending ? "menyimpan" : "simpan"}
        </Button>
      </form>
    </DialogPanel>
  );
}
