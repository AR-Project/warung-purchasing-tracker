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
