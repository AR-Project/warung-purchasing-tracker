"use client";

import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { removeImage } from "../_globalAction/image.action";
import { toast } from "react-toastify";
import { HiOutlineTrash } from "react-icons/hi";

type Props = {
  id: string;
};

export default function RemoveImage({ id }: Props) {
  const [state, formAction] = useFormState<FormState<string>, FormData>(
    removeImage,
    {}
  );

  const [isStateChanged, setStatedChanged] = useState(false);

  if (isStateChanged) {
    if (state.message) {
      if (state.data) {
        toast.success(JSON.stringify(state));
      }
    } else if (state.error) {
      toast.error(state.error);
    }
    setStatedChanged(false);
  }

  useEffect(() => {
    setStatedChanged(true);
  }, [state]);

  return (
    <form
      action={formAction}
      className="absolute right-0 top-0 flex flex-col z-10"
    >
      <input type="hidden" name="id" value={id} />
      <button
        className="transition-all group flex flex-row items-center gap-2 hover:bg-red-800 hover:border hover:border-gray-600 text-white p-1 rounded-sm w-full ml-auto"
        type="submit"
      >
        <p className="transition-all duration-200 ease-in-out w-[0px] group-hover:w-[100px]  overflow-hidden text-nowrap">
          Delete Image
        </p>
        <HiOutlineTrash className="shadow-sm text-gray-500 group-hover:text-white" />
      </button>
    </form>
  );
}
