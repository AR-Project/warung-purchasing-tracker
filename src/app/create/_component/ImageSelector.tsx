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
import clsx from "clsx";

type Props = {
  resizedFile: Blob | null;
  setResizedFile: Dispatch<SetStateAction<Blob | null>>;
};

export default function ImageSelector({ resizedFile, setResizedFile }: Props) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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
    // Monitor if current resizedFile (not yet uploaded) is cleared from parent component
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
    <div className="relative flex flex-col bg-blue-800/10 h-full">
      <input
        className="hidden"
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        onChange={inputFileOnChangeHandler}
        multiple={false}
      />
      {!resizedFile && (
        <div
          data-comment="Image Picker Button Container"
          className="flex flex-col h-full items-center justify-center border border-white/20 bg-g lg:p-5"
        >
          <button
            className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto lg:p-3 cursor-pointer"
            onClick={() => inputRef.current?.showPicker()}
          >
            <div className="m-1 p-1 border border-dashed border-white/50 flex flex-row items-center justify-center gap-6 lg:p-3 ">
              <FaRegFileImage />
              <div>Upload Foto Struk</div>
            </div>
          </button>
        </div>
      )}

      {resizedFile && (
        <button
          data-comment="DELETE BUTTON --> Clearing Image"
          className="absolute z-10 h-8 aspect-square flex items-center justify-center top-0 right-0 text-xl hover:text-red-500 border border-gray-600/50 bg-gray-500/50  text-white/50 rounded-sm cursor-pointer"
          onClick={resetCanvas}
        >
          <MdDelete />
        </button>
      )}

      <div
        data-comment="Canvas container"
        className={clsx(
          `relative flex flex-col overflow-y-scroll lg:max-h-full`,
          isExpanded ? "max-h-max" : "max-h-40"
        )}
      >
        <canvas
          className="w-full"
          ref={canvasRef}
          width={0}
          height={0}
          data-comment="Active image will displayed here"
        />
        {resizedFile && (
          <div className="sticky bottom-0 w-full flex flex-row bg-black lg:hidden">
            <button
              className="text-xs w-full border border-white flex flex-row items-center justify-center gap-5"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? (
                <>
                  <MdExpandLess />
                  <div>Minimize Image</div>
                  <MdExpandLess />
                </>
              ) : (
                <>
                  <MdExpandMore className="text-base" />
                  <div>Expand Image</div>
                  <MdExpandMore className="text-base" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
