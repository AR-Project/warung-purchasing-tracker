"use client";

import { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { FaRegFileImage } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import {
  type ImageReaderCallBack,
  userImageFileReader,
} from "@/lib/utils/reader";
import clsx from "clsx";

type Props = {
  resizedFile: Blob | null;
  setResizedFile: (blob: Blob | null) => void;
};

export default function SimpleImageSelector({
  resizedFile,
  setResizedFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageReaderCb: ImageReaderCallBack = (error, image) => {
    const squareLength = 120;

    const canvasElement = canvasRef.current;
    const ctx = canvasElement?.getContext("2d");

    if (!canvasElement || !ctx || !image) return;

    // Define canvas size
    canvasElement.width = squareLength;
    canvasElement.height = squareLength;

    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const srcAspect = iw / ih;
    const destAspect = 1; // 1 for square

    // Compute centered crop rectangle to "cover" the destination
    let sx = 0,
      sy = 0,
      sWidth = iw,
      sHeight = ih;

    if (srcAspect > destAspect) {
      // Source is wider → crop left/right
      sWidth = ih * destAspect; // for square, equals ih
      sx = (iw - sWidth) / 2;
    } else if (srcAspect < destAspect) {
      // Source is taller → crop top/bottom
      sHeight = iw / destAspect; // for square, equals iw
      sy = (ih - sHeight) / 2;
    }
    // else: aspect ratios already match — no cropping needed

    // Draw cropped source into 100×100 destination
    ctx.drawImage(
      image,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      squareLength,
      squareLength
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
    <div className="relative flex flex-col items-center justify-center h-full p-10">
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
            className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm ml-auto lg:p-3 cursor-pointer"
            onClick={() => inputRef.current?.showPicker()}
          >
            <div className="m-1 p-1 border border-dashed border-white/50 flex flex-row items-center justify-center gap-6 lg:p-3 ">
              <FaRegFileImage />
              <div>Pilih Gambar</div>
            </div>
          </button>
        </div>
      )}

      <div data-comment="Canvas container" className={clsx(`relative flex`)}>
        <canvas
          className=""
          ref={canvasRef}
          width={0}
          height={0}
          data-comment="Active image will displayed here"
        />
        {resizedFile && (
          <button
            data-comment="DELETE BUTTON --> Clearing Image"
            className="absolute z-10 h-8 aspect-square flex items-center justify-center top-0 right-0 text-xl hover:text-red-500 border border-gray-600/50 bg-gray-500/50  text-white/50 rounded-sm cursor-pointer"
            onClick={resetCanvas}
          >
            <MdDelete />
          </button>
        )}
      </div>
    </div>
  );
}
