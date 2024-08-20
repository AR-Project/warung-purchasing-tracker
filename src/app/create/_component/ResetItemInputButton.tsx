"use client";
import { RxCross2 } from "react-icons/rx";

type Props = {
  resetComboForm: () => void;
};

export function ResetItemInputButton({ resetComboForm }: Props) {
  return (
    <button
      className="border bg-gray-800 border-gray-500 h-10 aspect-square flex items-center justify-center ml-auto"
      onClick={resetComboForm}
      tabIndex={-1}
    >
      <RxCross2 />
    </button>
  );
}
