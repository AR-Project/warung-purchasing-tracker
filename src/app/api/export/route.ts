import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

import { readPurchaseItemForExport } from "@/service/database/readPurchaseItemForExport.service";

import { allRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import { safePromise } from "@/lib/utils/safePromise";
import { generateXlsxFile } from "@/lib/xlsx";

export async function GET(req: NextRequest) {
  const [user, authError] = await verifyUserAccess(allRole);
  if (authError)
    return NextResponse.json({ error: "not authorized" }, { status: 401 });

  const time = DateTime.now().setLocale("id-id");

  const filter = validateSearchParam(req.nextUrl.searchParams);

  const { data, error: repoError } = await safePromise(
    readPurchaseItemForExport(user, filter)
  );
  if (repoError) {
    console.log(repoError);

    return NextResponse.json(
      { error: "internal error", message: JSON.stringify(repoError) },
      { status: 503 }
    );
  }

  const xlsxFile = generateXlsxFile(data, [
    "Laporan Pembelian Barang",
    `${formatDate(filter.from)} - ${formatDate(filter.to)}`,
    `Laporan dibuat pada ${time.toLocaleString({
      weekday: "long",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
  ]);

  return NextResponse.json(data);

  return new NextResponse(xlsxFile, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Report ${time.toFormat(
        "yyyyLLdd_HHmmss"
      )}.xlsx"`,
    },
  });
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type DateRange = {
  from: Date;
  to: Date;
};

function validateSearchParam(searchParam: URLSearchParams): DateRange {
  const now = DateTime.now();
  const defaults = {
    from: now.startOf("day").minus({ years: 7 }),
    to: now.endOf("day"),
  };
  const schema = z.iso.date();

  // parsing
  let from = parseDay("from", "start") ?? defaults.from;
  let to = parseDay("to", "end") ?? defaults.to;

  // Ensure the range is ordered
  if (from.toMillis() > to.toMillis()) {
    [from, to] = [to.startOf("day"), from.endOf("day")];
  }

  return { from: from.toJSDate(), to: to.toJSDate() };

  /**
   * internal function
   */

  function parseDay(
    key: "from" | "to",
    boundary: "start" | "end"
  ): DateTime | null {
    const raw = searchParam.get(key);
    if (!raw) return null;

    const parsed = schema.safeParse(raw);
    if (!parsed.success) return null;

    const dt = DateTime.fromISO(parsed.data);
    if (!dt.isValid) return null;

    return boundary === "start" ? dt.startOf("day") : dt.endOf("day");
  }
}
