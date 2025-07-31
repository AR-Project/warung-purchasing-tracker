"use client";

import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaRegFileImage } from "react-icons/fa";
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";

import {
  type ImageReaderCallBack,
  userImageFileReader,
} from "@/lib/utils/reader";

type Props = {
  resizedFile: Blob | null;
  setResizedFile: Dispatch<SetStateAction<Blob | null>>;
};

export default function ImageSelector({ resizedFile, setResizedFile }: Props) {
  const [isMinimized, setMinimize] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageReaderCb: ImageReaderCallBack = (error, image) => {
    const canvasElement = canvasRef.current;
    const canvasContext = canvasElement?.getContext("2d");

    if (!canvasElement || !canvasContext || !image) return;

    // Define canvas size
    const CANVAS_WIDTH = 400;
    const scale_factor = CANVAS_WIDTH / image.naturalWidth;
    canvasElement.width = CANVAS_WIDTH;
    canvasElement.height = image.naturalHeight * scale_factor;

    // Impose image to canvas
    canvasContext.drawImage(
      image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // Transfer from canvas to blob
    canvasElement.toBlob(canvasToBlobCb, "image/jpeg", 0.5);

    // Callback function when `toBlob` is used
    function canvasToBlobCb(blob: Blob | null) {
      if (blob === null) return;
      setResizedFile(blob);
    }
  };
  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 0;
    canvas.height = 0;
    setResizedFile(null);
  }, [canvasRef, setResizedFile]);

  useEffect(() => {
    if (resizedFile === null) resetCanvas();
  }, [resizedFile, resetCanvas]);

  const inputFileOnChangeHandler = ({
    target: { files },
  }: ChangeEvent<HTMLInputElement>) => {
    if (files && files.length > 0) {
      const [fileOnForm] = files;
      userImageFileReader(fileOnForm, imageReaderCb);
    }
  };

  return (
    <div className="relative flex flex-col gap-3">
      <div className="hidden lg:inline font-bold text-center">
        Struk Belanja
      </div>
      <input
        className="hidden"
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        onChange={inputFileOnChangeHandler}
        multiple={false}
      />
      {resizedFile ? (
        <button
          className="absolute z-10 h-8 aspect-square flex items-center justify-center top-0 right-0 text-xl hover:text-red-500 border border-gray-600/50 bg-gray-500/50  text-white/50 rounded-sm"
          onClick={resetCanvas}
        >
          <MdDelete />
        </button>
      ) : (
        <div className="flex flex-col lg:h-96 items-center justify-center border border-white/20">
          <button
            className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto"
            onClick={() => inputRef.current?.showPicker()}
          >
            <div className="m-1 p-1 border border-dashed border-white/30 flex flex-row items-center justify-center gap-2 lg:h-fit">
              <FaRegFileImage /> Upload Foto Struk
            </div>
          </button>
        </div>
      )}
      <div
        data-comment="Canvas container"
        className={`flex flex-col relative  ${
          isMinimized && "max-h-40 lg:max-h-96 overflow-y-scroll"
        }`}
      >
        <canvas
          className="object-contain"
          ref={canvasRef}
          width={0}
          height={0}
          data-comment="Active image will displayed here"
        />
      </div>
      {resizedFile && (
        <div className="flex flex-row">
          <button
            className="text-xs w-full border border-white flex flex-row items-center justify-center gap-5"
            onClick={() => setMinimize((prev) => !prev)}
          >
            {isMinimized ? (
              <>
                <MdExpandMore className="text-base" />
                <div>Expand Image</div>
                <MdExpandMore className="text-base" />
              </>
            ) : (
              <>
                <MdExpandLess />
                <div>Minimize Image</div>
                <MdExpandLess />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
