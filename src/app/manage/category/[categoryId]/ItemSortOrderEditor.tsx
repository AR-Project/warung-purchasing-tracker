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
import { SortableItem } from "./SortableItem";
import updateItemSortOrderAction from "./_action/updateItemSortOrder.action";

export type ItemSortOrderEditorProps = {
  categoryId: string;
  currentItemsOrder: { id: string; name: string, imageUrl?: string }[];
};

export default function ItemSortOrderEditor({ categoryId, currentItemsOrder }: ItemSortOrderEditorProps) {
  const router = useRouter();

  const [originalItemIdOrder, setOriginalOrder] = useState(
    currentItemsOrder.map((item) => item.id)
  );
  const [_currentItemsOrder, setCurrentItemOrder] = useState(currentItemsOrder);

  function resetOrder() {
    setCurrentItemOrder(currentItemsOrder);
  }

  const updatedOrder = _currentItemsOrder.map((item) => item.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isEditModeActive = !checkIsArraySameOrder(
    originalItemIdOrder,
    updatedOrder
  );

  const [wrappedAction, isPending] = useServerAction(
    updateItemSortOrderAction,
    (msg) => {
      setOriginalOrder(_currentItemsOrder.map((ctg) => ctg.id));
      toast.success(msg);
      router.refresh();
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <div
      className={`mx-auto flex flex-col gap-2 w-full ${isEditModeActive && "bg-amber-900/40"
        }`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={_currentItemsOrder}
          strategy={verticalListSortingStrategy}
        >
          {_currentItemsOrder.map((item) => (
            <SortableItem key={item.id} data={item} />
          ))}
        </SortableContext>
      </DndContext>

      {isEditModeActive && (
        <div className="flex flex-row w-full gap-2 ">
          <button
            className=" grow h-10 px-2 bg-amber-800 disabled:bg-amber-950 disabled:text-gray-700 disabled:cursor-not-allowed border border-white/50 rounded-md cursor-pointer"
            onClick={saveChange}
          >
            ⚠️ Simpan Perubahan
          </button>
          <button
            className="grow h-10 px-2 bg-gray-800 disabled:bg-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed border border-white/50 rounded-md cursor-pointer"
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
      JSON.stringify(_currentItemsOrder.map((item) => item.id))
    );
    formData.set("category-id", categoryId)

    wrappedAction(formData);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setCurrentItemOrder((items) => {
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
