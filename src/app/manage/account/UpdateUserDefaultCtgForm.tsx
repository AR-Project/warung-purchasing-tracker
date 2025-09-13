"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { updateUserDefaultCategory } from "./_action/updateUserDefaultCategory.action";

type Props = {
  categoryList: {
    id: string;
    name: string;
  }[];
  currentDefaultCatgoryId: string;
};

export default function UpdateUserDefaultCategoryForm({
  categoryList,
  currentDefaultCatgoryId,
}: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    currentDefaultCatgoryId
  );
  const currentPath = usePathname();

  const [wrappedAction, isPending] = useServerAction(
    updateUserDefaultCategory,
    (m, d) => {
      toast.success(m);
    },
    (e) => {
      toast.error(e);
    }
  );
  return (
    <form
      action={wrappedAction}
      className="flex flex-col gap-2 bg-white/10 p-4 rounded-lg"
    >
      <h1 className="text-lg font-bold text-center">Change Default Category</h1>
      <input type="hidden" name="current-path" value={currentPath} />{" "}
      <select
        name="category-id"
        className="bg-gray-600 p-3 outline-1 outline-white rounded-sm w-full"
        value={selectedCategoryId}
        onChange={(e) => setSelectedCategoryId(e.target.value)}
      >
        {categoryList.map((ctg) => (
          <option value={ctg.id} key={ctg.id} className="font-sans">
            {ctg.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-500 p-2 text-lg rounded-sm border border-blue-800 font-bold disabled:border-gray-700 disabled:bg-gray-500 mt-10 cursor-pointer disabled:cursor-not-allowed"
        disabled={currentDefaultCatgoryId == selectedCategoryId}
      >
        {isPending ? "Menyimpan..." : "Ganti Category"}
      </button>
    </form>
  );
}
