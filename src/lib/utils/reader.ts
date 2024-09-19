export type UserFileReaderCallback = (
  error: unknown,
  result: string | ArrayBuffer | null
) => void;

/** Callback that exposing HTML Image Element. Do whatever with image  */
export type ImageReaderCallBack = (
  error: unknown,
  image: HTMLImageElement | null
) => void;

/** FileReader wrapper, expose onLoad callback */
export function userFileReader(file: File, callback: UserFileReaderCallback) {
  const fr = new FileReader();
  fr.onload = () => callback(null, fr.result);
  fr.onerror = (err) => callback(err, null);
  fr.readAsDataURL(file);
}

/** Offscreen HTML Image Element Wrapper.
 *
 * Accepting image dataUrl. Expose onLoad and onerror callback.
 */
export function imageReader(imageData: string, callback: ImageReaderCallBack) {
  const image = new Image();
  image.onload = () => callback(null, image);
  image.onerror = (err) => callback(err, null);
  image.src = imageData;
}

/** Read image file from **user file input**, and parse it to image inside offscreen HTML Image Element.
 *
 * Exposing Image.onload and Image.onerror callback.
 */
export function userImageFileReader(file: File, callback: ImageReaderCallBack) {
  userFileReader(file, (fileReaderError, result) => {
    if (typeof result !== "string") return;
    imageReader(result, (imageReaderErr, image) =>
      callback(imageReaderErr, image)
    );
  });
}
