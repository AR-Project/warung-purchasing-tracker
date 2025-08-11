"use client";

import { useRef } from "react";
import clsx from "clsx";

import { shortDateWithDay } from "@/lib/utils/formatter";

type Props = {
  originalDate: string;
  newDate: string | undefined;
  setDate: (dateString: string) => void;
};

export default function SingleDatePicker({
  originalDate,
  newDate,
  setDate,
}: Props) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="group flex flex-row grow relative">
      <input
        className="w-[0px] h-10"
        ref={dateInputRef}
        type="date"
        placeholder={originalDate}
        value={newDate}
        onChange={(e) => setDate(e.target.value)}
      />
      <button
        className={clsx(
          " grow border border-gray-400 hover:bg-blue-700/30 h-10 px-2",
          newDate === originalDate ? "bg-red-950" : " bg-gray-800"
        )}
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
