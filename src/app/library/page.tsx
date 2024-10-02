import React from "react";
import ImageUploader from "../_component/ImageUploader";
import db from "@/infrastructure/database/db";
import { images } from "@/lib/schema/schema";
import RemoveImage from "../_component/RemoveImage";
import Image from "next/image";

export default async function UploadImage() {
  const imagesList = await db.select().from(images);

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {imagesList.map((image) => (
          <div key={image.id} className="aspect-square relative">
            <Image
              key={image.id}
              src={`/api/image/${image.id}${image.fileExtension}`}
              fill
              alt=""
            />
            <RemoveImage id={image.id} />
          </div>
        ))}
      </div>
      <ImageUploader />
    </>
  );
}