import { useState } from "react";

type ServerAction<T> = (
  formData: FormData
) => Promise<FormStateWithTimestamp<T>>;

type ServerActionWithState<T> = (
  state: any,
  formData: FormData
) => Promise<FormStateWithTimestamp<T>>;

type OnSuccessCb<T> = (msg: string, data?: T) => void;
type OnErrorCb = (error: string) => void;

/** serverAction wrapper that expose callback whenever provided serveraction is
 * triggered and. This wrapper is for serverAction that used for `useFormState`
 */
export function useServerActionWithState<T = any>(
  serverAction: ServerActionWithState<T>,
  onSuccess: OnSuccessCb<T>,
  onError: OnErrorCb
) {
  const [isPending, setIsPending] = useState<boolean>(false);

  function actionHandler(formData: FormData) {
    setIsPending(true);
    serverAction({}, formData)
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
        console.log(error);
        setIsPending(false);
      });
  }

  return [actionHandler, isPending] as const;
}
