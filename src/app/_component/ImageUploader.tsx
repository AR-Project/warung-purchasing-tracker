"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { uploadImage } from "../_globalAction/image.action";
import { toast } from "react-toastify";
import {
  type ImageReaderCallBack,
  userImageFileReader,
} from "@/lib/utils/reader";
import { useStateChanged } from "@/presentation/hooks/useStateChanged";

export default function ImageUploader() {
  const [serverState, formAction] = useFormState<FormState<string>, FormData>(
    uploadImage,
    {}
  );

  const [file, setFile] = useState<File>();
  const [resizedFile, setResizedFile] = useState<Blob>();

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageReaderCb: ImageReaderCallBack = (error, image) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || !image) return;
    const CANVAS_SIDE_LENGTH = 400;

    canvas.width = CANVAS_SIDE_LENGTH;
    canvas.height = CANVAS_SIDE_LENGTH;

    const scale_factor = Math.min(
      CANVAS_SIDE_LENGTH / image.naturalWidth,
      CANVAS_SIDE_LENGTH / image.naturalHeight
    );

    const imageNewWidth = image.naturalWidth * scale_factor;
    const imageNewHeight = image.naturalHeight * scale_factor;

    const x = CANVAS_SIDE_LENGTH / 2 - imageNewWidth / 2;
    const y = CANVAS_SIDE_LENGTH / 2 - imageNewHeight / 2;

    ctx.rect(0, 0, CANVAS_SIDE_LENGTH, CANVAS_SIDE_LENGTH);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.drawImage(image, x, y, imageNewWidth, imageNewHeight);

    // Transfer from canvas to resizedFile State
    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) setResizedFile(blob);
      },
      "image/jpeg",
      0.7
    );
  };

  useStateChanged(() => {
    if (serverState.message && serverState.data) {
      toast.success(JSON.stringify(serverState));
      resetCanvas();
    }
    if (serverState.error) toast.error(serverState.error);
  }, serverState);

  useStateChanged(() => {
    if (file) userImageFileReader(file, imageReaderCb);
  }, file);

  const changeHandler = ({
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
    setResizedFile(undefined);
  }

  function interceptAction(formData: FormData): void {
    if (!resizedFile) {
      toast.error("No Image Selected");
      return;
    }
    formData.set("image", resizedFile, "pokokmen.jpg");
    formAction(formData);
    setResizedFile(undefined);
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <canvas ref={canvasRef} width={0} height={0} />
        <div className="flex flex-row gap-2">
          <button
            className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto"
            onClick={() => inputRef.current?.showPicker()}
          >
            Cari File
          </button>
          <button
            // Debug Playground
            className="bg-green-900 hover:bg-green-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto"
            onClick={resetCanvas}
          >
            Reset Canvas
          </button>
        </div>
        <input
          className="p-2 bg-gray-700 hidden"
          ref={inputRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={changeHandler}
          required
        />

        <form action={interceptAction} className="flex flex-col">
          <button
            className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto disabled:bg-blue-800/30 disabled:cursor-not-allowed disabled:text-white/30 disabled:border-gray-600/30"
            type="submit"
            disabled={!resizedFile}
          >
            Upload Image
          </button>
        </form>
      </div>
    </>
  );
}
