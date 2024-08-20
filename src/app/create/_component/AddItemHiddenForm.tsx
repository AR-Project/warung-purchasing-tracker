"use client";
import { type SetStateAction, useCallback, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import { ImCancelCircle } from "react-icons/im";

import { createNewItem } from "../action";

type Props = {
  name: string | undefined;
  setSelectedItem: (value: SetStateAction<Item>) => void;
  setNewItemName: (value: SetStateAction<string | undefined>) => void;
};

export default function AddItemHiddenForm({
  name,
  setSelectedItem,
  setNewItemName,
}: Props) {
  const [state, formAction] = useFormState<FormState<string>, FormData>(
    createNewItem,
    {}
  );

  const [isStateUpdated, setIsStateUpdated] = useState<boolean>(false);

  if (isStateUpdated) {
    if (state.message) {
      toast.success(state.message);
      if (state.data && name) {
        setSelectedItem({ id: state.data, name });
        setNewItemName(undefined);
      }
    }

    if (state.error) {
      toast.error(state.error);
    }
    setIsStateUpdated(false);
  }

  useEffect(() => {
    setIsStateUpdated(true);
  }, [state]);

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
