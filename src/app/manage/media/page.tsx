import React from "react";
import { Metadata } from "next";

import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import ImageUploader from "@/app/_component/ImageUploader";
import RemoveImage from "@/app/_component/RemoveImage";
import { verifyUserAccess } from "@/lib/utils/auth";
import { allRole } from "@/lib/const";

import { imagesLoader } from "./_loader/imagesLoader";

export const metadata: Metadata = {
  title: "WPT - Manage Media",
};

export default async function UploadImage() {
  const [user, authError] = await verifyUserAccess(allRole);
  if (authError) return <LoginRequiredWarning />;

  const imagesList = await imagesLoader(user.parentId);

  return (
    <div className="flex flex-col gap-3">
      <h1 className="py-2 text-center font-bold text-xl border-b">
        Manage Media
      </h1>
      <div className="grid grid-cols-3 gap-4">
        {imagesList.map((image) => (
          <div
            key={image.id}
            className="aspect-square relative flex  border border-yellow-500 object-cover"
          >
            <img
              key={image.id}
              src={`/api/image/${image.url}`}
              alt=""
              className="object-cover h-full w-full"
            />
            <RemoveImage id={image.id} />
          </div>
        ))}
      </div>
      <ImageUploader />
    </div>
  );
}

export const dynamic = "force-dynamic";
