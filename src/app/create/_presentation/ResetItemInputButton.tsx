"use client";
import { RxCross2 } from "react-icons/rx";

type Props = {
  resetComboForm: () => void;
};

export function ResetItemInputButton({ resetComboForm }: Props) {
  return (
    <button
      className="border bg-gray-600 border-gray-500 h-12 px-2 flex items-center justify-center ml-auto"
      onClick={resetComboForm}
      tabIndex={-1}
    >
      <RxCross2 />
    </button>
  );
}
