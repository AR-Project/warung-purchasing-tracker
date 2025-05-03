"use client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { SortableCategory } from "./SortableCategory";
import EmptyCategory from "./EmptyCategory";
import updateOrderCategoryAction from "../_action/updateOrderCategory.action";

type DisplayCategory = { id: string; name: string };

type Props = {
  categories: DisplayCategory[];
  user: UserSession;
};

export default function CategoryOrderEditor({ categories, user }: Props) {
  const router = useRouter();

  if (categories.length <= 0) {
    return <EmptyCategory user={user} />;
  }

  const [originalOrder, setOriginalOrder] = useState(
    categories.map((category) => category.id)
  );
  const [currentCtgryOrder, setCurrentCtgrOrder] = useState(categories);

  function resetOrder() {
    setCurrentCtgrOrder(categories);
  }

  // const originalOrder = categories.map((category) => category.id);
  const updatedOrder = currentCtgryOrder.map((item) => item.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isEditModeActive = !checkIsArraySameOrder(originalOrder, updatedOrder);

  const [wrappedAction, isPending] = useServerAction(
    updateOrderCategoryAction,
    (msg) => {
      setOriginalOrder(currentCtgryOrder.map((ctg) => ctg.id));
      toast.success(msg);
      router.refresh();
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <div
      className={`mx-auto flex flex-col gap-2 w-full ${
        isEditModeActive && "bg-amber-900/40"
      }`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={currentCtgryOrder}
          strategy={verticalListSortingStrategy}
        >
          {currentCtgryOrder.map((category) => (
            <SortableCategory
              key={category.id}
              category={category}
              user={user}
            />
          ))}
        </SortableContext>
      </DndContext>

      {isEditModeActive && (
        <div className="flex flex-row w-full gap-2 ">
          <button
            className=" grow h-10 px-2 bg-amber-800 disabled:bg-amber-950 disabled:text-gray-700 disabled:cursor-not-allowed border border-white/50 rounded-md "
            onClick={saveChange}
          >
            ⚠️ Simpan Perubahan
          </button>
          <button
            className="grow h-10 px-2 bg-gray-800 disabled:bg-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed border border-white/50 rounded-md "
            onClick={() => {
              resetOrder();
            }}
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );

  function saveChange() {
    // toast.info("TODO");
    const formData = new FormData();
    formData.set(
      "new-order",
      JSON.stringify(currentCtgryOrder.map((ctg) => ctg.id))
    );

    wrappedAction(formData);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setCurrentCtgrOrder((items) => {
        const oldIndex = items.findIndex((item) => item.id == active.id);
        const newIndex = items.findIndex((item) => item.id == over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function checkIsArraySameOrder(array1: string[], array2: string[]) {
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }
}
