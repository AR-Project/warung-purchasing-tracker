"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { MdDragIndicator } from "react-icons/md";

type Props = {
  data: { id: string; name: string, imageUrl?: string };
};

export function SortableItem({ data }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: data.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-grey rounded-md bg-gray-800 gap-2  h-12 flex flex-row justify-center items-center "
      {...attributes}
      {...listeners}
    >
      <div className="w-full border-gray-600/75 text-gray-400 group-hover:text-white group-hover:underline flex flex-row gap-2 cursor-move h-12 items-center">
        {
          data.imageUrl ?
            <img src={`/api/image/${data.imageUrl}`} className="h-full rounded-sm" /> :
            <div className="h-full aspect-square bg-gradient-to-b from-gray-500 to-gray-700 rounded-sm" />
        }

        <Link href={`/transaction/item/detail/${data.id}`}>{data.name}</Link>
      </div>
      <MdDragIndicator className=" transition-opacity ease-in-out duration-100 text-3xl opacity-20 group-hover:opacity-100 cursor-move" />
    </div>
  );
}
