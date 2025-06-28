import EditItemHiddenForm from "@/app/create/_component/EditItemHiddenForm";
import { ItemRowData } from "@/lib/schema/item";
import { DateTime } from "luxon";

type Props = {
  itemData: ItemRowData & {
    owner: { username: string };
    creator: { username: string };
    category: { name: string };
  };
};

export default function ItemDetailCard({ itemData }: Props) {
  return (
    <article className="flex flex-row gap-2 justify-between">
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
        <EditItemHiddenForm
          selectedItem={{ id: itemData.id, name: itemData.name }}
          label="Ubah Nama"
        />
      </div>
      <div className="h-28 aspect-square flex flex-row justify-center items-center bg-blue-700/20">
        {itemData.imageId ? "Image" : "n / a"}
      </div>
    </article>
  );
}
