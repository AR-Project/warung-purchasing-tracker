import { notFound } from "next/navigation";
import Link from "next/link";

import { BackButton } from "@/app/_component/BackButton";
import CreateItemModal from "@/app/_component/item/CreateItemModal";
import { ItemRowData } from "@/lib/schema/item";
import { manageCategoryDetailLoader } from "./loader";
import EditCategoryModal from "../_component/EditCategoryModal";

type Params = { categoryId: string };

type Props = {
  params: Promise<Params>;
};

export default async function Page({ params }: Props) {
  const { categoryId } = await params;
  const data = await manageCategoryDetailLoader(categoryId);
  if (!data) return notFound();

  return (
    <div className="max-w-md mx-auto p-1 flex flex-col gap-2 py-2">
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
      <div className="border border-white/20 p-2 rounded-md flex flex-col gap-2">
        <div className=" flex flex-row justify-between">
          <div className="opacity-30 italic ">Daftar Item</div>
          <div className=" opacity-50 px-3 hover:underline border border-white/70 cursor-not-allowed">
            Ubah Urutan
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 row-auto">
          {data.items.map((item) => (
            <ItemUnderCategory key={item.id} item={item} />
          ))}
          <CreateItemModal categoryId={categoryId} label="Buat item Baru" />
        </div>
      </div>
    </div>
  );
}

type ItemUnderCategoryProps = {
  item: ItemRowData;
};

function ItemUnderCategory({ item }: ItemUnderCategoryProps) {
  return (
    <Link
      href={`/transaction/item/detail/${item.id}`}
      className="border-blue-500/50 border p-2 text-sm hover:bg-white/10"
      target="_blank"
    >
      {item.name}
    </Link>
  );
}
