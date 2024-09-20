"use client";

import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from "react";
import {
  type ImageReaderCallBack,
  userImageFileReader,
} from "@/lib/utils/reader";
import { FaRegFileImage } from "react-icons/fa";
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";

type Props = {
  resizedFile: Blob | null;
  setResizedFile: Dispatch<SetStateAction<Blob | null>>;
};

export default function ImageSelector({ resizedFile, setResizedFile }: Props) {
  const [file, setFile] = useState<File>();
  const [minimize, setMinimize] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageReaderCb: ImageReaderCallBack = (error, image) => {
    const canvasElement = canvasRef.current;
    const canvasContext = canvasElement?.getContext("2d");

    if (!canvasElement || !canvasContext || !image) return;

    // Process Image - Resize to 400
    const CANVAS_WIDTH = 400;
    const scale_factor = CANVAS_WIDTH / image.naturalWidth;
    canvasElement.width = CANVAS_WIDTH;
    canvasElement.height = image.naturalHeight * scale_factor;
    const imageNewWidth = CANVAS_WIDTH;
    const imageNewHeight = image.naturalHeight * scale_factor;

    canvasContext.drawImage(image, 0, 0, imageNewWidth, imageNewHeight);

    // Transfer from canvas to resizedFile State
    canvasElement.toBlob(canvasToBlobCb, "image/jpeg", 0.7);

    function canvasToBlobCb(blob: Blob | null) {
      if (blob === null) return;
      setResizedFile(blob);
    }
  };

  useStateChanged(() => {
    if (file) userImageFileReader(file, imageReaderCb);
  }, file);

  useStateChanged(() => {
    if (resizedFile === null) resetCanvas();
  }, resizedFile);

  const inputFileOnChangeHandler = ({
    target: { files },
  }: ChangeEvent<HTMLInputElement>) => {
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  function resetCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = 0;
    canvas.height = 0;
    setFile(undefined);
    setResizedFile(null);
  }

  return (
    <div className="relative">
      <input
        className="hidden"
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        onChange={inputFileOnChangeHandler}
      />
      {file ? (
        <button
          className="absolute z-10 h-8 aspect-square flex items-center justify-center top-0 right-0 text-xl hover:text-red-500 border border-gray-600/50 bg-gray-500/50  text-white/50 rounded-sm"
          onClick={resetCanvas}
        >
          <MdDelete />
        </button>
      ) : (
        <button
          className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto"
          onClick={() => inputRef.current?.showPicker()}
        >
          <div className="m-1 p-1 border border-dashed border-white/30 flex flex-row items-center justify-center gap-2">
            <FaRegFileImage /> Upload Foto Struk
          </div>
        </button>
      )}
      <div
        className={`flex flex-col relative ${
          minimize && "max-h-40 overflow-y-scroll"
        }`}
      >
        <canvas
          className="object-contain"
          ref={canvasRef}
          width={0}
          height={0}
        />
      </div>
      {file && (
        <div className="flex flex-row">
          <button
            className="text-xs w-full border border-white flex flex-row items-center justify-center gap-5"
            onClick={() => setMinimize((prev) => !prev)}
          >
            {minimize ? (
              <>
                <MdExpandMore className="text-base" /> Expand
              </>
            ) : (
              <>
                {" "}
                <MdExpandLess />
                Minimize
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
