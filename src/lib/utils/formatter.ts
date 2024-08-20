export const formatNumberToIDR = (number: number) => {
  const formatter = new Intl.NumberFormat("id-Id", {
    style: "currency",
    currency: "IDR",
  });

  return formatter.format(number);
};
