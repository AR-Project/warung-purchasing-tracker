import { notFound } from "next/navigation";
import { Metadata } from "next";

import { BackButton } from "@/app/_component/BackButton";
import CreateItemModal from "@/app/_component/item/CreateItemModal";
import { manageCategoryDetailLoader } from "./loader";
import EditCategoryModal from "../_component/EditCategoryModal";
import ItemSortOrderEditorClient from "./ItemSortOrderEditorClient";

type Params = { categoryId: string };

type Props = {
  params: Promise<Params>;
};

export const metadata: Metadata = {
  title: "WPT - Manage Category",
};

export default async function Page({ params }: Props) {
  const { categoryId } = await params;
  const data = await manageCategoryDetailLoader(categoryId);
  if (!data) return notFound();

  const items = data.items.map(({ id, name, imageUrl }) => ({ id, name, imageUrl }));

  return (
    <div className="max-w-md mx-auto p-1 flex flex-col gap-2 py-2 w-full">
      <div className="flex flex-row bg-blue-950 items-center gap-3">
        <BackButton /> Kembali
      </div>
      {/* CATEGORY DETAIL */}
      <div className="flex flex-row justify-between border border-white/20 items-center-safe p-2 rounded-md ">
        <div>
          <div className="text-xs/tight opacity-30 italic">Nama Kategori</div>
          <div>{data.name}</div>
        </div>
        <EditCategoryModal category={{ id: categoryId, name: data.name }} />
      </div>

      {/* ITEM LIST */}
      <div className="border border-white/20 p-2 rounded-md flex flex-col gap-2 w-full">
        <div className=" flex flex-row justify-between">
          <div className="opacity-30 italic ">Daftar Item</div>

        </div>
        <ItemSortOrderEditorClient categoryId={categoryId} currentItemsOrder={items} />
        <div className="grid grid-cols-3 gap-3 row-auto w-full ">
          <CreateItemModal categoryId={categoryId} label="Buat item Baru" />
        </div>
      </div>
    </div>
  );
}
