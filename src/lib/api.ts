"use client";

export const searchItems = async (query: string) => {
  const response = await fetch("/api/search/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword: query }),
  });

  return response;
};

export const searchVendors = async (query: string) => {
  const response = await fetch("/api/search/vendors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword: query }),
  });
  return response;
};

export type ISearchVendorsWithCallBack<T> = {
  query: string;
  onSuccess: (data: T) => void;
  onFail: () => void;
  onError: (error: unknown) => void;
};

export const searchVendorsWithCallback = async <T = any>({
  query,
  onSuccess,
  onFail,
  onError,
}: ISearchVendorsWithCallBack<T>) => {
  try {
    const response = await fetch("/api/search/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: query }),
    });
    if (response.status === 200) {
      const data = (await response.json()) as unknown as T;
      onSuccess(data);
    } else {
      onFail();
    }
  } catch (error) {
    onError(error);
  }
};
