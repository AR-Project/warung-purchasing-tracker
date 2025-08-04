"use client";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { HiOutlineTrash } from "react-icons/hi";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { removeImage } from "@/app/_globalAction/image.action";

type Props = {
  id: string;
};

// TODO: MAKE this into a modal with warning

export default function RemoveImage({ id }: Props) {
  const currentPath = usePathname();

  const [removeImageWrapped, isRemoveImagePending] = useServerAction(
    removeImage,
    (msg, data) => {
      toast.success(msg);
    },
    (err) => toast.error(err)
  );

  return (
    <form
      action={removeImageWrapped}
      className="absolute right-0 top-0 flex flex-col z-10"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="current-path" value={currentPath} />
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
