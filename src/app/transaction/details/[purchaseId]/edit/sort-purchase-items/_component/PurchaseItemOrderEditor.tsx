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

import { SortableItem } from "./SortableItem";
import { useState } from "react";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { updateListOrderOfPurchaseItem } from "../_action/UpdatePurchaseItemsOrder.action";

type Props = {
  listOfPurchaseItem: PurchaseItemDisplay[];
  purchaseId: string;
};

export default function PurchaseItemOrderEditor({
  listOfPurchaseItem,
  purchaseId,
}: Props) {
  const router = useRouter();

  const [itemsOrder, setItemsOrder] = useState(listOfPurchaseItem);

  const originalOrder = listOfPurchaseItem.map((item) => item.id);
  const updatedOrder = itemsOrder.map((item) => item.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [formAction, isPending] = useServerAction(
    updateListOrderOfPurchaseItem,
    (msg, data) => {
      toast.success(msg);
      router.push(`/transaction/details/${purchaseId}/edit`);
    },
    (err) => {
      toast.error(err);
    }
  );

  function updateHandler() {
    const form = new FormData();
    form.append("purchase-id", purchaseId);
    form.append("updated-list", JSON.stringify(updatedOrder));
    formAction(form);
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-2 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemsOrder}
          strategy={verticalListSortingStrategy}
        >
          {itemsOrder.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>

      <button
        className="h-10 px-2 bg-blue-800 disabled:bg-blue-950 disabled:text-gray-700 disabled:cursor-not-allowed"
        onClick={() => {
          updateHandler();
        }}
        disabled={checkIsArraySameOrder(originalOrder, updatedOrder)}
      >
        Save Order
      </button>
    </div>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setItemsOrder((items) => {
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
