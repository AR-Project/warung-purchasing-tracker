"use client";

import { toast } from "react-toastify";

import { DisplaySingleItem } from "@/presentation/component/DisplaySingleItem";
import { useForm } from "@/presentation/hooks/useForm";
import DeletePurchaseSingleItemForm from "../_hiddenForm/DeletePurchaseSingleItemForm";
import { deleteSingleItemAction } from "../_action/deleteSingleItem.action";
import { EditorType } from "./PurchaseEditor";
import { formatNumberToIDR } from "@/lib/utils/formatter";
import ItemDataEditorAlt from "./ItemDataEditorAlt";

type Props = {
  items: PurchasedItemsEditor[];
  purchaseId: string;
  selectEditor: (type: EditorType | null) => void;
  activeEditor: EditorType | null;
  totalPrice: number;
};

export default function ItemsEditor({
  items,
  purchaseId,
  selectEditor,
  activeEditor,
  totalPrice,
}: Props) {
  const isItemsEditorActive =
    activeEditor === "delete-item" || activeEditor === "edit-data-item";

  function toggleDelete() {
    selectEditor(activeEditor == "delete-item" ? null : "delete-item");
  }

  function toggleEditDataItem() {
    selectEditor(activeEditor == "edit-data-item" ? null : "edit-data-item");
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
      <div className="flex flex-row gap-2">
        <button
          className={`${
            activeEditor === "delete-item"
              ? "text-white bg-blue-800"
              : " bg-blue-950"
          } h-8 px-3 rounded-sm border border-gray-500/50 `}
          onClick={() => toggleDelete()}
        >
          Delete Items
        </button>
        <button
          className={`${
            activeEditor === "edit-data-item"
              ? "text-white bg-blue-800"
              : " bg-blue-950"
          } h-8 px-3 rounded-sm border border-gray-500/50 `}
          onClick={() => toggleEditDataItem()}
        >
          Modify Item
        </button>
        <button className="h-8 px-3 rounded-sm border border-gray-500/50 bg-blue-950 text-white/30 cursor-not-allowed">
          Change Order
        </button>
      </div>
      <div className="border border-gray-600/30 z-0 overflow-clip">
        {items.map((item) => (
          <div className="flex relative w-full" key={item.id}>
            <div
              className={`
                ${isItemsEditorActive && "pr-12"}
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
              <ItemDataEditorAlt
                purchaseId={purchaseId}
                activeEditor={activeEditor}
                purchasedItem={item}
              />
            </div>
          </div>
        ))}
        <h3 className="p-3 w-full text-center text-xl font-mono font-black bg-gray-900">
          {formatNumberToIDR(totalPrice)}
        </h3>
      </div>
      <div className="">
        <button className="h-8 px-3 border border-gray-500/50 bg-blue-950 text-white/30 cursor-not-allowed">
          Add Item
        </button>
      </div>
    </div>
  );
}
