import { DateTime } from "luxon";

export const formatNumberToIDR = (
  number: number,
  type: "short" | "long" = "long"
) => {
  const formatter = new Intl.NumberFormat("id-Id", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    currencyDisplay: "symbol",
  });
  if (type === "short") {
    return formatter.format(number).replace("Rp", "").trim();
  }
  return formatter.format(number);
};

/** Convert date object to longday-DD-m-yy */
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

export const stringToDate = (dateString: string | Date | undefined) => {
  if (dateString === undefined) return "";

  if (dateString instanceof Date) {
    return DateTime.fromJSDate(dateString).setLocale("id").toLocaleString({
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  }

  return DateTime.fromISO(dateString).setLocale("id").toLocaleString({
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

/** Convert date string to DD/MM. Return `""` when string is not valid */
export const superShortDate = (date: string | undefined) => {
  if (date === undefined) return "";

  return DateTime.fromISO(date).setLocale("id").toLocaleString({
    day: "2-digit",
    month: "2-digit",
  });
};
