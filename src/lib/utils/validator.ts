import { DateTime } from "luxon";

/**
 * Check if Form Data entry Value is string and not null.
 */
export function isString(data: FormDataEntryValue | null): data is string {
  return data !== null && typeof data === "string";
}

/**
 * Sanitize and convert unknown value to number multipled by 100.
 * If not a number, always return 0
 */
export const anyNumberToHundred = (value: unknown) => {
  if (typeof value !== "number") return 0;
  return value * 100;
};

/**
 * Sanitize and convert unknown value to number. If not a number, return 0
 */
export const anyNumberToNumber = (value: unknown) => {
  if (typeof value !== "number") return 0;
  return value;
};

/** Check if string is a valid date */
export function isDateStringValid(dateStr: string) {
  return DateTime.fromISO(dateStr).isValid;
}

export function isISODateStrValid(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== "string") return false;

  const date = dateStr.split("-");
  const [year, month, day] = date;

  if (date.length !== 3) return false;
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) return false;
  return true;
}
