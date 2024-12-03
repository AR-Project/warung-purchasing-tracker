import { Dispatch, SetStateAction, useRef } from "react";

import { shortDate } from "@/lib/utils/formatter";

type Props = {
  txDate: string;
  setTxDate: Dispatch<SetStateAction<string>>;
};

export default function DatePicker({ txDate, setTxDate }: Props) {
  const datePickerRef = useRef<HTMLInputElement>(null);

  return (
    <button
      className="relative bg-gray-800 w-full h-12 border border-gray-600 flex flex-row gap-3 items-center justify-center basis-1/4"
      onClick={() => datePickerRef.current?.showPicker()}
      title="Tanggal Transaksi"
    >
      {txDate === "" ? (
        <span className="text-white/50 text-xs flex flex-row items-center gap-2">
          <span className="text-xl">🗓️ ...</span>
        </span>
      ) : (
        <span className="text-sm"> {shortDate(txDate)} </span>
      )}
      <input
        ref={datePickerRef}
        tabIndex={-1}
        className="absolute bottom-0 left-0 w-[0px] h-[0px]"
        type="date"
        name="date"
        id="date"
        onChange={(e) => setTxDate(e.target.value)}
      />
    </button>
  );
}
