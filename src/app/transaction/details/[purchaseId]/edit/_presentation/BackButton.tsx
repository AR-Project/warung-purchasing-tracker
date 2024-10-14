"use client";

import { useRouter } from "next/navigation";
import { MdArrowBackIosNew } from "react-icons/md";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      className="bg-blue-900 h-10 aspect-square flex flex-row justify-center items-center rounded-sm  border border-gray-700 text-xl"
      onClick={() => router.back()}
    >
      <MdArrowBackIosNew />
    </button>
  );
}
