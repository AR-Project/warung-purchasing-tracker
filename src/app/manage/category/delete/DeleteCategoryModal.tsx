"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import deleteCategoryAction from "../_action/deleteCategory.action";

type Props = {
  user: UserSession;
  category: {
    id: string;
    name: string;
  };
};

export default function DeleteCategoryModal(props: Props) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className="data-[hover]:bg-red-400 border border-white/50 rounded-sm bg-red-400/30 h-10 aspect-square cursor-pointer flex items-center justify-center"
      >
        <MdDelete />
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
            <Panel closeDialog={close} {...props} />
          </div>
        </div>
      </Dialog>
    </>
  );
}

type PanelProps = Props & {
  closeDialog: () => void;
};

function Panel({ closeDialog, user, category }: PanelProps) {
  const router = useRouter();

  const [wrappedAction, isPending] = useServerAction(
    deleteCategoryAction,
    (msg) => {
      toast.success(msg);
      closeDialog();
    },
    (err) => {
      toast.error(err);
    }
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <DialogPanel
      transition
      className="w-full max-w-xs rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Hapus Kategori
      </DialogTitle>
      <form action={wrappedAction}>
        <input type="hidden" name="category-id" value={category.id} />
        Kategori
        <span className="mx-2 bg-red-300/30 px-1 border border-white/30 rounded-sm">
          {category.name}
        </span>
        akan dihapus. Lanjutkan?
        <div className="mt-4 flex flex-row gap-3">
          <Button
            type="submit"
            className="inline-flex items-center gap-2 rounded-sm bg-red-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-red-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          >
            Hapus
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
            onClick={closeDialog}
          >
            Batal
          </Button>
        </div>
      </form>
    </DialogPanel>
  );
}
