import { Dispatch, SetStateAction, useRef } from "react";
import { PiCalendarDotsBold } from "react-icons/pi";

import { stringToDate } from "@/lib/utils/formatter";

type Props = {
  txDate: string;
  setTxDate: Dispatch<SetStateAction<string>>;
};

export default function DatePicker({ txDate, setTxDate }: Props) {
  const datePickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col">
      <button
        className=" bg-gray-800 w-full h-10 border border-gray-600 flex flex-row gap-3 items-center"
        onClick={() => datePickerRef.current?.showPicker()}
        title="Tanggal Transaksi"
      >
        <div className="h-10 aspect-square flex flex-row justify-center items-center border-r border-gray-600">
          <PiCalendarDotsBold />
        </div>
        {txDate === "" ? (
          <span className="text-white/50 italic text-xs">
            Pilih Tanggal Transaksi...
          </span>
        ) : (
          stringToDate(txDate)
        )}
      </button>
      <input
        ref={datePickerRef}
        className="w-[0px] h-[0px]"
        type="date"
        name="date"
        id="date"
        onChange={(e) => setTxDate(e.target.value)}
      />
    </div>
  );
}
