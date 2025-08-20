import UpdateItemCategoryModal from "@/app/_component/item/UpdateItemCategoryModal";
import UpdateItemImageModal from "@/app/_component/item/UpdateItemImageModal";
import UpdateItemNameModal from "@/app/_component/item/UpdateItemNameModal";
import { ItemRowData } from "@/lib/schema/item";
import { DateTime } from "luxon";

type Props = {
  itemData: ItemRowData & {
    owner: { username: string };
    creator: { username: string };
    category: { name: string };
    image: { url: string } | null;
  };
};

export default function ItemDetailCard({ itemData }: Props) {
  return (
    <article className="w-full flex flex-col gap-2">
      <div className="flex flex-row gap-2 justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm italic text-gray-300">
            {itemData.category.name}
          </h3>
          <h1 className="font-bold text-lg">{itemData.name}</h1>
          <span className="text-sm italic text-gray-500">
            {itemData.owner.username}
          </span>
          <div className="text-xs text-gray-500">
            {DateTime.fromJSDate(itemData.createdAt)
              .setLocale("id")
              .toLocaleString({
                weekday: "long",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
          </div>
        </div>
        <div className=" flex flex-col justify-center items-center ">
          <div className="h-28 aspect-square bg-blue-700/20">
            {itemData.image !== null ? (
              <img src={`/api/image/${itemData.image.url}`} />
            ) : (
              <div>n / a</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <UpdateItemNameModal
          selectedItem={{ id: itemData.id, name: itemData.name }}
          label="Ubah Nama"
        />
        <UpdateItemCategoryModal
          item={{ id: itemData.id, name: itemData.name }}
          currentCategoryId={itemData.categoryId}
        />
        <UpdateItemImageModal itemId={itemData.id} />
      </div>
    </article>
  );
}
