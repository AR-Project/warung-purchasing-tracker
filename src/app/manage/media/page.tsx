import React from "react";

import Image from "next/image";
import { imagesLoader } from "./_loader/imagesLoader";
import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import ImageUploader from "@/app/_component/ImageUploader";
import RemoveImage from "@/app/_component/RemoveImage";

export default async function UploadImage() {
  const session = await auth();
  if (!session) {
    return <LoginRequiredWarning />;
  }

  const imagesList = await imagesLoader(session.user.parentId);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="py-2 text-center font-bold text-xl border-b">
        Manage Media
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {imagesList.map((image) => (
          <div key={image.id} className="aspect-square relative">
            <Image key={image.id} src={`/api/image/${image.id}`} fill alt="" />
            <RemoveImage id={image.id} />
          </div>
        ))}
      </div>
      <ImageUploader />
    </div>
  );
}

export const dynamic = "force-dynamic";
