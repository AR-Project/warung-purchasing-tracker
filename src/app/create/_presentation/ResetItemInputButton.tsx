"use client";

import { MdUndo } from "react-icons/md";

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
      <MdUndo />
    </button>
  );
}
