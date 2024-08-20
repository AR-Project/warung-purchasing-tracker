"use client";
import { type SetStateAction, useCallback, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FiPlusSquare } from "react-icons/fi";
import { ImCancelCircle } from "react-icons/im";

import { createNewVendor } from "../action";

type Props<T> = {
  name: string | undefined;
  setSelected: (value: SetStateAction<T>) => void;
  setNewName: (value: SetStateAction<string | undefined>) => void;
};

export default function AddVendorHiddenForm<T>({
  name,
  setSelected,
  setNewName,
}: Props<Vendor>) {
  const [state, formAction] = useFormState<FormState<string>, FormData>(
    createNewVendor,
    {}
  );
  const [isFormStateChanged, setIsFormStateChanged] = useState<boolean>(false);

  useEffect(() => {
    setIsFormStateChanged(true);
  }, [state]);

  if (isFormStateChanged) {
    if (state.message) {
      toast.success(state.message);
      if (state.data && name) setSelected({ id: state.data, name });
      setNewName(undefined);
    }

    if (state.error) {
      toast.error(state.error);
    }
    setIsFormStateChanged(false);
  }

  return (
    <>
      <form action={formAction} className="flex flex-row ">
        <input type="hidden" name="name" id="item-name" value={name} />
        {name && (
          <>
            <button
              type="submit"
              className=" flex flex-row gap-2 px-2 h-10 items-center bg-green-900 border-t border-b border-gray-500  w-fit hover:bg-green-800"
            >
              <FiPlusSquare className="text-xl" /> Baru
            </button>
            <button
              className=" flex flex-row gap-2 px-2 h-10 items-center bg-gray-500 border border-gray-500  w-fit hover:bg-gray-400"
              onClick={() => {
                setSelected({ id: "", name: "" });
                setNewName(undefined);
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
