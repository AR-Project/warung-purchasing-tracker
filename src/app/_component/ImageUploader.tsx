"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { uploadImage } from "@/app/_globalAction/image.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";

import ImageSelector from "../create/_component/ImageSelector";
import { usePathname } from "next/navigation";

export default function ImageUploader() {
  const currentPath = usePathname();
  const [uploadImageWrapped, isUploadImagePending] = useServerAction(
    uploadImage,
    (msg, data) => toast.success("uploaded"),
    (err) => toast.error(err)
  );

  const [resizedFile, setResizedFile] = useState<Blob | null>(null);

  function interceptAction(formData: FormData): void {
    if (!resizedFile) return;
    formData.set("image", resizedFile, "from-manage-item");
    setResizedFile(null);
    uploadImageWrapped(formData);
  }

  return (
    <>
      <ImageSelector
        resizedFile={resizedFile}
        setResizedFile={setResizedFile}
      />

      <form action={interceptAction} className="flex flex-col">
        <input type="hidden" name="current-path" value={currentPath} />
        <button
          className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto disabled:bg-blue-800/30 disabled:cursor-not-allowed disabled:text-white/30 disabled:border-gray-600/30"
          type="submit"
          disabled={!resizedFile || isUploadImagePending}
        >
          {isUploadImagePending ? "Sedang menyimpan..." : " Simpan ke server"}
        </button>
      </form>
    </>
  );
}
