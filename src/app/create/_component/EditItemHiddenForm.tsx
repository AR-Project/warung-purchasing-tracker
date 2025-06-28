"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { ImCancelCircle, ImCheckmark } from "react-icons/im";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { updateItemName } from "@/app/_globalAction/item/updateItemName.action";

type Props = {
  selectedItem: Item;
  updateItem?: (item: Item) => void;
  label?: string;
};

export default function EditItemHiddenForm({
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
        className=" border border-gray-600 bg-gray-800 h-10 aspect-square flex items-center justify-center text-sm font-medium text-white focus:outline-none data-[hover]:bg-yellow-300/30 data-[focus]:outline-1 data-[focus]:outline-white"
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
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 outline-2 outline-blue-400 flex flex-col gap-2"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-white"
              >
                Masukkan nama baru:
              </DialogTitle>
              <form action={editItemAction} className="flex flex-col gap-4">
                <input
                  className="bg-gray-800 w-full p-2 mb-3"
                  type="hidden"
                  name="id"
                  id="item-name"
                  value={selectedItem.id}
                />
                <div>
                  <input
                    className="bg-gray-800 w-full p-2"
                    type="text"
                    name="name"
                    id="item-name"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                  />
                  <div className="flex flex-row w-full items-end gap-2">
                    <Button
                      type="submit"
                      className=" flex flex-row gap-2 p-2 items-center bg-green-900 border border-gray-500 rounded-md  w-fit hover:bg-green-800"
                    >
                      <ImCheckmark className="text-xl" /> Ganti
                    </Button>
                    <Button
                      className="BTN-CANCEL flex flex-row gap-2 p-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
                      onClick={close}
                    >
                      <ImCancelCircle className="text-xl text-gray-300" /> Batal
                    </Button>
                  </div>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
