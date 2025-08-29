"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { updateItemCategory } from "@/app/_globalAction/item/updateItemCategory.action";
import { getCategory } from "@/app/_globalAction/category/getCategory.loader";
import { createCategoryAndMoveItemAction } from "@/app/_globalAction/categoryItem/createCategoryAndMoveItem.action";

type Props = {
  item: { id: string; name: string };
  currentCategoryId: string;
};

/**
 * MODAL TRIGGER
 */

export default function UpdateItemCategoryModal(props: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [categorylist, setCategoryList] = useState<
    { id: string; name: string }[]
  >([]);

  function openModal() {
    startTransition(async () => {
      const categoryListResult = await getCategory();
      categoryListResult !== null
        ? setCategoryList(categoryListResult)
        : setCategoryList([]);
      setIsOpen(true);
    });
  }

  function closeModal() {
    setIsOpen(false);
  }

  const [wrappedAction] = useServerAction(
    updateItemCategory,
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
        {isPending ? "Loading..." : "Ubah Kategori"}
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
            <Panel
              closeDialog={closeModal}
              action={wrappedAction}
              categoryList={categorylist}
              {...props}
            />
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
  categoryList: { id: string; name: string }[];
};

function Panel({
  closeDialog,
  action,
  item,
  categoryList,
  currentCategoryId,
}: PanelProps) {
  const router = useRouter();
  const currentPath = usePathname();

  const [secondAction] = useServerAction(
    createCategoryAndMoveItemAction,
    (msg) => {
      toast.success(msg);
      closeDialog();
      router.refresh();
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <DialogPanel
      transition
      className="w-full max-w-xs rounded-sm border border-gray-300/70 bg-gray-800 p-6 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
    >
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Pilih Kategori
      </DialogTitle>
      <form action={action} className=" py-5">
        <input type="hidden" name="item-id" value={item.id} />
        <input type="hidden" name="path-to-revalidate" value={currentPath} />

        <select
          name="target-category-id"
          className="bg-gray-600 p-3 outline-1 outline-white rounded-sm w-full"
          defaultValue={currentCategoryId}
        >
          {categoryList.map((ctg) => (
            <option value={ctg.id} key={ctg.id} className="font-sans">
              {ctg.name}
            </option>
          ))}
        </select>

        <div className="mt-4 flex flex-row gap-3">
          <Button
            type="submit"
            className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700 cursor-pointer"
          >
            Ganti Kategori
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 d cursor-pointer"
            onClick={closeDialog}
          >
            Batal
          </Button>
        </div>
      </form>
      <div className="w-full text-center italic py-6">atau...</div>
      <DialogTitle as="h3" className="text-lg font-bold text-white">
        Buat Kategori baru
      </DialogTitle>
      <div className=" text-sm text-gray-300">
        Membuat kategori baru dan memindah item kedalamnya
      </div>
      <form action={secondAction} className="py-5">
        <input type="hidden" name="item-id" value={item.id} />
        <input type="hidden" name="path-to-revalidate" value={currentPath} />

        <input
          type="text"
          name="new-category"
          className="bg-gray-600 w-full p-2 outline outline-white rounded-sm"
          placeholder="Nama kategori Baru"
          minLength={3}
          required
        />

        <div className="mt-4 flex flex-row gap-3">
          <Button
            type="submit"
            className="inline-flex items-center gap-2 rounded-sm bg-blue-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-blue-500 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700 cursor-pointer"
          >
            Buat Kategori
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded-sm bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700 cursor-pointer"
            onClick={closeDialog}
          >
            Batal
          </Button>
        </div>
      </form>
    </DialogPanel>
  );
}
