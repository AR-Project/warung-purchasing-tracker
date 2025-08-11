"use client";

import { useState } from "react";
import { DateTime } from "luxon";

import { stringToDate } from "@/lib/utils/formatter";
import SingleDatePicker from "./SingleDatePicker";
import CloseEditorButton from "../_presentation/CloseEditorButton";
import ShowEditorButton from "../_presentation/ShowEditorButton";
import UpdatePurchaseDateHiddenForm from "./UpdatePurchaseDateForm";

type Props = {
  currentDate: Date;
  purchaseId: string;
};

export default function PurchaseDateEditor({ purchaseId, currentDate }: Props) {
  const [newDate, setNewDate] = useState<string>("");
  const [isActive, setIsActive] = useState(false);

  function closeEditor() {
    setIsActive(false);
    setNewDate("");
  }

  function setDate(dateString: string) {
    setNewDate(dateString);
  }
  const currDateRaw = DateTime.fromJSDate(currentDate).toISODate();
  const currentDateISO = currDateRaw ? currDateRaw : "";

  return (
    <div>
      <div className="text-sm italic px-2 text-gray-500">Purchase Date</div>
      <div className="relative flex flex-row w-full overflow-clip">
        {/* Displayer */}
        <div className="z-10 flex flex-row justify-between items-center w-full border border-gray-600/30">
          <div className="px-2">{stringToDate(currentDate)}</div>
          <ShowEditorButton onClick={() => setIsActive(true)} />
        </div>

        {/* Pop Up */}
        <div
          className={`z-20 transition-transform ease-in-out duration-200 absolute flex flex-row w-full bg-gray-600 ${
            isActive ? "translate-x-[0%]" : "translate-x-[100%]"
          }`}
        >
          <CloseEditorButton onClick={closeEditor} />
          <SingleDatePicker
            newDate={newDate}
            originalDate={currentDateISO}
            setDate={setDate}
          />
          {newDate && (
            <UpdatePurchaseDateHiddenForm
              currentPurchaseDate={currentDateISO}
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
