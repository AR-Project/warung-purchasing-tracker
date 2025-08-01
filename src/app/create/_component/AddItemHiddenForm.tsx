"use client";
import { type SetStateAction } from "react";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import { ImCancelCircle } from "react-icons/im";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { createItemAction } from "@/app/_globalAction/item/createItem.action";

type Props = {
  name: string | undefined;
  setSelectedItem: (value: SetStateAction<Item>) => void;
  setNewItemName: (value: SetStateAction<string | undefined>) => void;
};

/** @deprecated */
export default function AddItemHiddenForm({
  name,
  setSelectedItem,
  setNewItemName,
}: Props) {
  const [formAction] = useServerAction(
    createItemAction,
    (msg, data) => {
      toast.success(msg);
      if (!data || !name) return;
      setSelectedItem(data);
      setNewItemName(undefined);
    },
    (err) => {
      toast.error(err);
    }
  );
  return (
    <>
      <form action={formAction} className="flex flex-row gap-0.5">
        <input
          className="bg-gray-800 w-full p-2"
          type="hidden"
          name="name"
          id="item-name"
          value={name}
        />
        {name && (
          <>
            <button
              type="submit"
              className=" flex flex-row gap-2 p-2 items-center bg-green-900 border border-gray-500 rounded-md  w-fit hover:bg-green-800"
            >
              <FiPlusSquare className="text-xl" /> Baru
            </button>
            <button
              className=" flex flex-row gap-2 p-2 items-center bg-gray-500 border border-gray-500 rounded-md  w-fit hover:bg-gray-400"
              onClick={() => {
                setSelectedItem({ id: "", name: "" });
                setNewItemName(undefined);
              }}
            >
              <ImCancelCircle className="text-xl text-gray-300" /> Batal
            </button>
          </>
        )}
      </form>
    </>
  );
}
