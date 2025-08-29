"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { ImCancelCircle, ImCheckmark } from "react-icons/im";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { updateItemName } from "@/app/_globalAction/item/updateItemName.action";

type Props = {
  selectedItem: Item;
  updateItem?: (item: Item) => void;
  label?: string;
};

export default function UpdateItemNameModal({
  updateItem,
  selectedItem,
  label,
}: Props) {
  const [editItemAction] = useServerAction(
    updateItemName,
    (msg, data) => {
      if (!data) return;
      updateItem && updateItem(data);
      toast.success(msg);

      close();
    },
    (err) => toast.error(err)
  );

  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState<string>(selectedItem.name);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setNewName("");
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className="h-8 border border-white/50 px-2 bg-green-950 rounded-sm text-white focus:outline-none data-[hover]:bg-green-800 data-[focus]:outline-1 data-[focus]:outline-white flex flex-row gap-2 justify-center items-center"
        tabIndex={-1}
        title="Edit Item"
      >
        {label ? label : <FiEdit />}
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
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 outline-2 outline-blue-400 flex flex-col gap-2"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-white text-center"
              >
                Ubah Item
              </DialogTitle>
              <form action={editItemAction} className="flex flex-col gap-4">
                <input
                  className="bg-gray-800 w-full p-2 mb-3"
                  type="hidden"
                  name="id"
                  id="item-name"
                  value={selectedItem.id}
                />
                <input
                  className="bg-gray-800 w-full p-2 border border-white/20"
                  type="text"
                  name="name"
                  id="item-name"
                  placeholder="Ketik Nama baru..."
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <div className="flex flex-row w-full justify-center items-end gap-4">
                  <Button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700 cursor-pointer"
                  >
                    <ImCheckmark className="text-xl" /> Ganti
                  </Button>
                  <Button
                    className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700 cursor-pointer"
                    onClick={close}
                  >
                    <ImCancelCircle className="text-xl text-gray-300" /> Batal
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
