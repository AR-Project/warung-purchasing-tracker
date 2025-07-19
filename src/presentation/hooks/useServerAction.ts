import { useState, useTransition } from "react";

type ServerAction<T> = (formData: FormData) => Promise<FormState<T>>;

type OnSuccessCb<T> = (msg: string, data?: T) => void;
type OnErrorCb = (error: string) => void;

/**
 * ServerAction wrapper, exposing callbacks. Can be used with regular server action
 *
 * @param serverAction A server Action that return FormState
 * @param onSuccess Callback when action is success. Passing message and data (optional)
 * @param onError Callback when action is fail. Passing error message as string
 * @returns An array contains form action ready to passed to form action.
 */
export function useServerAction<T = any>(
  serverAction: ServerAction<T>,
  onSuccess: OnSuccessCb<T>,
  onError: OnErrorCb
) {
  const [isPending, setTransition] = useTransition();

  function actionHandler(formData: FormData) {
    setTransition(async () => {
      const result = await serverAction(formData);
      if (result.message) {
        onSuccess(result.message, result.data);
      }

      if (result.error) {
        onError(result.error);
      }
    });
  }

  return [actionHandler, isPending] as const;
}
