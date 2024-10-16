import React from "react";
import { MdClose } from "react-icons/md";

type Props = {
  onClick: () => void;
};

export default function CloseEditorButton({ onClick }: Props) {
  return (
    <button
      onClick={() => onClick()}
      className="h-10 aspect-square bg-gray-700 text-blue-300 text-3xl flex flex-row justify-center items-center"
    >
      <MdClose />
    </button>
  );
}
