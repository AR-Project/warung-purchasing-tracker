"use client";

import { usePathname, useRouter } from "next/navigation";
import { MdArrowBackIosNew } from "react-icons/md";

export function BackButton() {
  const router = useRouter();
  const path = usePathname();

  return (
    <button
      className="bg-blue-900 h-10 aspect-square flex flex-row justify-center items-center rounded-sm  border border-gray-700 text-xl cursor-pointer"
      onClick={() => {
        const splitPath = path.split("/");
        splitPath.pop();
        router.replace(splitPath.join("/"));
      }}
    >
      <MdArrowBackIosNew />
    </button>
  );
}
