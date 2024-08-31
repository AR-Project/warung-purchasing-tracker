import { DateTime } from "luxon";

export const formatNumberToIDR = (number: number) => {
  const formatter = new Intl.NumberFormat("id-Id", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

  return formatter.format(number);
};

export const shortDateWithDay = (date: Date) => {
  return DateTime.fromJSDate(date).setLocale("id").toLocaleString({
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};
export const shortDate = (date: Date) => {
  return DateTime.fromJSDate(date).toFormat("dd/mm/yy");
};
export const superShortDate = (date: string | undefined) => {
  if (date === undefined) return "";

  return DateTime.fromISO(date).setLocale("id").toLocaleString({
    day: "2-digit",
    month: "2-digit",
  });
};
