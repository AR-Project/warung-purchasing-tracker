import React from "react";

import ImageUploader from "../_component/ImageUploader";
import RemoveImage from "../_component/RemoveImage";
import Image from "next/image";
import { imagesLoader } from "./_loader/imagesLoader";

export default async function UploadImage() {
  const imagesList = await imagesLoader();

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {imagesList.map((image) => (
          <div key={image.id} className="aspect-square relative">
            <Image key={image.id} src={`/api/image/${image.id}`} fill alt="" />
            <RemoveImage id={image.id} />
          </div>
        ))}
      </div>
      <ImageUploader />
    </>
  );
}

export const dynamic = "force-dynamic";
