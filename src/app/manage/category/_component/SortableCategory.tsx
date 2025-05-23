"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDragIndicator } from "react-icons/md";

type Props = {
  category: { id: string; name: string };
  user: UserSession;
};

export function SortableCategory({ category, user }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-grey rounded-md bg-gray-800 gap-2 p-1 pl-3 flex flex-row justify-center items-center "
      {...attributes}
      {...listeners}
    >
      <div className="w-full p-2 border-gray-600/75 text-gray-400 group-hover:text-white flex flex-row gap-2 cursor-move ">
        <div> {category.name}</div>
      </div>
      <MdDragIndicator className=" transition-opacity ease-in-out duration-100 text-3xl opacity-20 group-hover:opacity-100" />
    </div>
  );
}
