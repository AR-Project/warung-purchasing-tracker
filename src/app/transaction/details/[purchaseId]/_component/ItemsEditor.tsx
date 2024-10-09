"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";
import { useForm } from "@/presentation/hooks/useForm";
import DeletePurchaseSingleItemForm from "../_hiddenForm/DeletePurchaseSingleItemForm";
import { deleteSingleItemAction } from "../_action/deleteSingleItem.action";
import { EditorType } from "./PurchaseEditor";

type Props = {
  items: DisplaySingleItem[];
  purchaseId: string;
  selectEditor: (type: EditorType | null) => void;
  activeEditor: EditorType | null;
};

export default function ItemsEditor({
  items,
  purchaseId,
  selectEditor,
  activeEditor,
}: Props) {
  const [previousEditor, setPreviousEditor] = useState<EditorType | null>(null);
  if (previousEditor !== activeEditor) {
    setPreviousEditor(activeEditor);
  }

  function toggleDelete() {
    selectEditor(activeEditor == "delete-item" ? null : "delete-item");
  }

  const [formAction] = useForm(
    deleteSingleItemAction,
    (msg) => toast.success(msg),
    (err) => toast.error(err)
  );

  return (
    <div>
      <div className="text-sm italic px-2 text-gray-500">
        Items on current purchase
      </div>
      <div className="border border-gray-600/30 z-0 overflow-clip">
        {items.map((item) => (
          <div className="flex relative w-full" key={item.id}>
            <div
              className={`
                ${activeEditor == "delete-item" && "pr-12"}
                p-2 w-full
                `}
            >
              <DisplaySingleItem item={item} />
              <DeletePurchaseSingleItemForm
                isActive={activeEditor === "delete-item"}
                purchaseId={purchaseId}
                purchaseItemId={item.id}
                formAction={formAction}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="">
        <button
          className={`${
            activeEditor === "delete-item"
              ? "text-white bg-blue-800"
              : " bg-blue-950"
          } h-8 px-3 border border-gray-500/50 `}
          onClick={() => toggleDelete()}
        >
          Delete Items
        </button>
        <button className="h-8 px-3 border border-gray-500/50 bg-blue-800 text-white/30">
          Modify Item
        </button>
        <button className="h-8 px-3 border border-gray-500/50 bg-blue-800 text-white/30 cursor-not-allowed">
          Change Order
        </button>
        <button className="h-8 px-3 border border-gray-500/50 bg-blue-800 text-white/30 cursor-not-allowed">
          Add Item
        </button>
      </div>
    </div>
  );
}
