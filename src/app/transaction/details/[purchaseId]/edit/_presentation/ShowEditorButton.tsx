import React from "react";
import { MdModeEdit } from "react-icons/md";

type Props = {
  onClick: () => void;
};

export default function ShowEditorButton({ onClick }: Props) {
  return (
    <button
      onClick={() => onClick()}
      className="h-10 bg-blue-800 aspect-square flex flex-row justify-center items-center"
    >
      <MdModeEdit />
    </button>
  );
}
