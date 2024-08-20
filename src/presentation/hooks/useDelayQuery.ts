import { useEffect, useState } from "react";

export function useDelayQuery(query: string, timeoutInMs: number = 800) {
  const [delayedQuery, setDelayedQuery] = useState("");

  useEffect(() => {
    const timeOutId = setTimeout(() => setDelayedQuery(query), timeoutInMs);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return [delayedQuery] as const;
}
