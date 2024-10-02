import { useEffect, useState } from "react";

/** Hooks for run callback only once, after a state is changed  */
export function useStateChanged<T = any>(
  callback: () => void,
  stateToWatch: T
) {
  const [isStateChanged, setIsStateChanged] = useState<boolean>(false);
  if (isStateChanged) {
    callback();
    setIsStateChanged(false);
  }

  useEffect(() => {
    setIsStateChanged(true);
  }, [stateToWatch]);
}