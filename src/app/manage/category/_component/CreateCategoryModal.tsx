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
import { MdAdd } from "react-icons/md";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import createCategoryAction from "../_action/createCategory.action";

type Props = {
  user: UserSession;
};

/**
 * MODAL TRIGGER
 */

export default function CreateCategoryModal(props: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const [wrappedAction, isPending] = useServerAction(
    createCategoryAction,
    (msg) => {
      toast.success(msg);
      closeModal();
      router.refresh();
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <>
      <Button
        onClick={openModal}
        className="h-8 border border-white/50 px-2 bg-green-950 rounded-sm text-white focus:outline-none data-[hover]:bg-green-800 data-[focus]:outline-1 data-[focus]:outline-white flex flex-row gap-2 justify-center items-center"
      >
        <MdAdd /> Create Category
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
            <Panel closeDialog={closeModal} action={wrappedAction} {...props} />
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
  action: (formData: FormData) => void;
};

function Panel({ closeDialog, action }: PanelProps) {
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
        Buat Kategori baru
      </DialogTitle>
      <form action={action}>
        <input
          ref={inputRef}
          type="text"
          name="category-name"
          className="mt-2 text-base text-white/70 bg-gray-700 border border-white w-full p-2"
          placeholder="Ketik nama kategori baru..."
        />

        <div className="mt-4 flex flex-row gap-3">
          <Button
            type="submit"
            className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
          >
            Buat Baru
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
