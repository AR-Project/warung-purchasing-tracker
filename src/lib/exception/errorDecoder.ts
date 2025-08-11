import ClientError from "./ClientError";

export function errorDecoder(error: unknown): [null, string] {
  return [
    null,
    error instanceof ClientError ? error.message : "internal error",
  ];
}

export function actionErrorDecoder(err: unknown): {
  error: string;
} {
  return { error: err instanceof ClientError ? err.message : "internal error" };
}
