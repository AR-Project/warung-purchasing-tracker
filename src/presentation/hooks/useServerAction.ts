import { useState } from "react";

type ServerAction<T> = (
  formData: FormData
) => Promise<FormStateWithTimestamp<T>>;

type OnSuccessCb<T> = (msg: string, data?: T) => void;
type OnErrorCb = (error: string) => void;

/** ServerAction wrapper, exposing callbacks. Can be used with regular server action */

export function useServerAction<T = any>(
  serverAction: ServerAction<T>,
  onSuccess: OnSuccessCb<T>,
  onError: OnErrorCb
) {
  const [isPending, setIsPending] = useState<boolean>(false);

  function actionHandler(formData: FormData) {
    setIsPending(true);
    serverAction(formData)
      .then((state) => {
        if (state.message) {
          onSuccess(state.message, state.data);
        }

        if (state.error) {
          onError(state.error);
        }
        setIsPending(false);
      })
      .catch((error) => {
        setIsPending(false);
        console.log(error);
      });
  }

  return [actionHandler, isPending] as const;
}
