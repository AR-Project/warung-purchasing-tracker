"use client";

import { useRef } from "react";

import { shortDateWithDay } from "@/lib/utils/formatter";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";

type Props = {
  originalDate: string;
  newDate: string | undefined;
  setDate: (dateString: string | undefined) => void;
  isEditorActive: boolean;
};

export default function SingleDatePicker({
  originalDate,
  newDate,
  setDate,
  isEditorActive,
}: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  useStateChanged(() => {
    if (!isEditorActive) {
      setDate(undefined);
    }
  }, isEditorActive);

  return (
    <div className="group flex flex-row grow relative">
      <input
        className="w-[0px] h-10"
        ref={dateInputRef}
        type="date"
        placeholder={originalDate}
        value={newDate}
        onChange={(e) => {
          setDate(e.target.value);
        }}
      />
      <button
        className=" grow border bg-gray-800 border-gray-400 hover:bg-blue-700/30 h-10 px-2"
        onClick={() => dateInputRef.current?.showPicker()}
      >
        {newDate ? (
          shortDateWithDay(new Date(newDate))
        ) : (
          <span className="italic text-sm text-gray-300">Pilih Tanggal...</span>
        )}
      </button>
    </div>
  );
}
