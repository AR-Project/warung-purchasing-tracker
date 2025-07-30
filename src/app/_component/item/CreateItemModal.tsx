"use client";
import { useActionState, useState } from "react";
import { toast } from "react-toastify";
import { ImCancelCircle, ImCheckmark } from "react-icons/im";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { MdAdd } from "react-icons/md";
import { usePathname } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { createItemAction } from "@/app/_globalAction/item/createItem.action";

type Props = {
  categoryId?: string;
  onSuccess?: (item: Item) => void;
  label?: string;
};

export default function CreateItemModal({
  onSuccess = (_) => {},
  categoryId,
  label,
}: Props) {
  const [wrappedAction, isPending] = useServerAction(
    createItemAction,
    (msg, data) => {
      if (!data) return;
      onSuccess(data);
      toast.success(msg);
      close();
    },
    (err) => toast.error(err)
  );

  const currentPath = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState<string>("");

  function open() {
    setIsOpen(true);
  }

  function close() {
    setName("");
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className=" border border-gray-600 bg-gray-800 h-full w-full flex flex-col items-center justify-center text-sm  text-white focus:outline-none data-[hover]:bg-yellow-300/30 data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer"
        tabIndex={-1}
        title="Edit Item"
      >
        <MdAdd className="font-medium" />
        <div className="italic text-xs/tight opacity-50">{label}</div>
      </Button>
      <Dialog
        open={isOpen}
        className="relative z-20 focus:outline-none"
        onClose={close}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
        <div className="fixed flex inset-0 z-10 w-screen  items-center justify-center border border-white">
          <DialogPanel
            transition
            className="w-full max-w-xs rounded-sm bg-gray-950 p-2  duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 outline-1 outline-blue-400/50 py-6 flex flex-col gap-2"
          >
            <DialogTitle as="h3" className="text-base/7 font-medium text-white">
              Buat Item Baru
            </DialogTitle>
            <form action={wrappedAction} className="flex flex-col gap-4">
              {categoryId && (
                <input
                  type="hidden"
                  name="category-id"
                  id="category-id"
                  value={categoryId}
                />
              )}
              <input
                type="hidden"
                name="path-to-revalidate"
                id="path-to-revalidate"
                value={currentPath}
              />
              <input
                className="bg-gray-800 w-full p-2 outline outline-white/50 rounded-xs placeholder:italic placeholder:text-sm"
                type="text"
                name="name"
                id="item-name"
                placeholder="Ketik nama item..."
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="flex flex-row w-full items-end gap-2">
                <Button
                  type="submit"
                  className=" flex flex-row gap-2 p-2 items-center bg-green-900 border border-gray-500 rounded-md  w-fit hover:bg-green-800"
                >
                  {isPending ? (
                    <>Sedang diproses</>
                  ) : (
                    <>
                      <ImCheckmark className="text-xl" /> Simpan
                    </>
                  )}
                </Button>
                <Button
                  className="BTN-CANCEL flex flex-row gap-2 p-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
                  onClick={close}
                >
                  <ImCancelCircle className="text-xl text-gray-300" /> Batal
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
