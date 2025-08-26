import db, { Tx } from "@/infrastructure/database/db";
import { errorDecoder } from "@/lib/exception/errorDecoder";
import { safePromise } from "@/lib/utils/safePromise";

export function dbTxWrapper<TPayload, TOut>(
  txLogic: (tx: Tx, payload: TPayload) => Promise<TOut>
) {
  return async (payload: TPayload): Promise<SafeResult<TOut, string>> => {
    const { data, error } = await safePromise(
      db.transaction((tx) => txLogic(tx, payload))
    );
    if (error) return errorDecoder(error);
    return [data, null];
  };
}
