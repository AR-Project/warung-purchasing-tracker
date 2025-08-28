import { DateTime } from "luxon";
import { z } from "zod";

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

export function isValidDate(value: unknown): string {
  const schema = z.string().date();
  try {
    return schema.parse(value);
  } catch {
    return "";
  }
}

export function dateRangeValidator(
  params: SearchParams
): RangeFilter | undefined {
  const rangeFilterSchema = z.object({
    from: z.iso.date(),
    to: z.iso.date(),
  });

  const { data: range, error: paramsError } = rangeFilterSchema.safeParse({
    from: params.from,
    to: params.to,
  });

  if (paramsError) return;

  const fromDate = DateTime.fromISO(range.from).toMillis();
  const toDate = DateTime.fromISO(range.to).toMillis();

  if (toDate - fromDate < 0) return;

  return range;
}

function queryValidator(params: SearchParams): string | undefined {
  const keywordSchema = z.string();
  try {
    return keywordSchema.parse(params.q);
  } catch {
    return;
  }
}

export function parseSearchParams(params: SearchParams): SearchFilter {
  return {
    range: dateRangeValidator(params),
    keyword: queryValidator(params),
  };
}

export function arraysHaveEqualElements(array1: string[], array2: string[]) {
  if (array1.length !== array2.length) return false;
  const set1 = new Set(array1);
  const set2 = new Set(array2);
  if (set1.size !== set2.size) return false;

  for (const element of array1) {
    if (!set2.has(element)) return false;
  }
  return true;
}
