import { Dispatch, SetStateAction, useState } from "react";

import { stringToDate } from "@/lib/utils/formatter";
import { EditorType } from "./PurchaseEditor";
import ShowEditorButton from "../_presentation/ShowEditorButton";
import CloseEditorButton from "../_presentation/CloseEditorButton";
import SingleDatePicker from "./SingleDatePicker";
import UpdatePurchaseDateHiddenForm from "../_hiddenForm/UpdatePurchaseDateForm";

type Props = {
  currentDate: Date;
  purchaseId: string;
  activeEditor: EditorType | null;
  setActiveEditor: Dispatch<SetStateAction<EditorType | null>>;
};

export default function PurchaseDateEditor({
  purchaseId,
  currentDate,
  setActiveEditor,
  activeEditor,
}: Props) {
  const [newDate, setNewDate] = useState<string>();

  const isActive = activeEditor === "purchase-date";

  function closeEditor() {
    setActiveEditor(null);
  }

  function setDate(dateString: string | undefined) {
    setNewDate(dateString);
  }

  return (
    <div>
      <div className="text-sm italic px-2 text-gray-500">Purchase Date</div>
      <div className="relative flex flex-row w-full overflow-clip">
        {/* Displayer */}
        <div className="z-10 flex flex-row justify-between items-center w-full border border-gray-600/30">
          <div className="px-2">{stringToDate(currentDate)}</div>
          <ShowEditorButton onClick={() => setActiveEditor("purchase-date")} />
        </div>

        {/* Pop Up */}
        <div
          className={`z-20 transition-transform ease-in-out duration-200 absolute flex flex-row w-full bg-gray-600 ${
            isActive ? "translate-x-[0%]" : "translate-x-[100%]"
          }`}
        >
          <CloseEditorButton onClick={closeEditor} />
          <SingleDatePicker
            isEditorActive={isActive}
            newDate={newDate}
            originalDate={stringToDate(currentDate)}
            setDate={setDate}
          />
          {newDate && (
            <UpdatePurchaseDateHiddenForm
              newPurchaseDate={newDate}
              onSuccess={closeEditor}
              purchaseId={purchaseId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
