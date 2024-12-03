"use server";

import { z } from "zod";
import { writeImageFile } from "@/infrastructure/storage/localStorage";

export async function imageTest(formData: FormData) {
  const payload = formData.get("image");

  const imageSchema = z.custom<Blob>(
    (data) => data instanceof Blob && data.type === "image/jpeg"
  );
  const { data: img } = imageSchema.safeParse(payload);
  if (!img) return { error: "Expect a image" };

  const [metadata] = await writeImageFile(img);
  if (!metadata) return { error: "Fail to Write Image" };

  console.log(metadata);

  return { message: "ok", data: metadata };
}
