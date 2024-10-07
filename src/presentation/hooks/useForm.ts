import { useState } from "react";
import { useFormState } from "react-dom";

type ServerActionWithState<ReturnedData = any> = (
  prevState: any,
  formData: FormData
) => Promise<FormStateWithTimestamp<ReturnedData>>;

type OnSuccessCallback<ReturnedData = any> = (
  message: string,
  data?: ReturnedData
) => void;

type OnErrorCallback = (error: string) => void;

/** ServerAction wrapper. Exposing onSuccess and onError Callback. */
export function useForm<ReturnedData = any>(
  serverAction: ServerActionWithState<ReturnedData>,
  onSuccess: OnSuccessCallback<ReturnedData>,
  onError: OnErrorCallback
) {
  const [state, formAction] = useFormState<
    FormStateWithTimestamp<ReturnedData>,
    FormData
  >(serverAction, {});

  const [previousState, setPreviousState] = useState<string>();

  if (state.timestamp !== previousState) {
    if (state.message) {
      onSuccess(state.message, state.data);
    }
    if (state.error) {
      onError(state.error);
    }

    setPreviousState(state.timestamp);
  }

  return [formAction] as const;
}
