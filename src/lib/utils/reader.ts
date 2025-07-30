export type UserFileReaderCallback = (
  error: unknown,
  result: string | ArrayBuffer | null
) => void;

/** Callback that exposing HTML Image Element. Do whatever with image  */
export type ImageReaderCallBack = (
  error: unknown,
  image: HTMLImageElement | null
) => void;

/** Read a `File` and pass it to callback function.
 *
 * Callback function has two parameter: `Error` and result as `string | ArrayBuffer | null` */
export function userFileReader(file: File, callback: UserFileReaderCallback) {
  const fr = new FileReader();
  fr.onload = () => callback(null, fr.result);
  fr.onerror = (err) => callback(err, null);
  fr.readAsDataURL(file);
}

/** Read a image as `dataUrl` and passing to a single callback.
 *
 * Callback function has two parameter: `Error` and `HTMLImageElement` */
export function imageReader(imageData: string, callback: ImageReaderCallBack) {
  const image = new Image();
  image.onload = () => callback(null, image);
  image.onerror = (err) => callback(err, null);
  image.src = imageData;
}

/** Read file from **user file input**, verify if its a image, and pass it to callback function as parameter.
 *
 * Callback function has two parameter: `Error` and `HTMLImageElement`
 */
export function userImageFileReader(file: File, callback: ImageReaderCallBack) {
  userFileReader(file, (fileReaderError, result) => {
    if (typeof result !== "string") return;
    imageReader(result, (imageReaderErr, image) =>
      callback(imageReaderErr, image)
    );
  });
}
