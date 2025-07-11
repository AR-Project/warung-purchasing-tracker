import ClientError from "./ClientError";

export function errorDecoder(error: unknown): [null, string] {
  return [
    null,
    error instanceof ClientError ? error.message : "internal error",
  ];
}
