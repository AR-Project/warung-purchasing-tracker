import * as XLSX from "xlsx";

type JsonRow = {
  name: string;
  txCount: number;
  quantityInHundredsSum: number;
  totalPriceSum: number;
};

type JsonData = JsonRow[];

export function generateXlsxFile(jsonData: JsonData, metadata: string[] = []) {
  const aoa: any[][] = [];

  // metadata rows
  for (const line of metadata) aoa.push([line]);

  // blank row
  aoa.push([]);

  // header row
  aoa.push(["Name", "Total Transaction", "Total Quantity", "Total Price"]);

  // data rows
  for (const row of jsonData) {
    aoa.push([
      row.name,
      row.txCount,
      (row.quantityInHundredsSum / 100).toFixed(2),
      row.totalPriceSum,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa); // worksheet
  const wb = XLSX.utils.book_new(); // workbook
  XLSX.utils.book_append_sheet(wb, ws, "Report"); // append
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return Uint8Array.from(buf); // Compability with NextResponse
}
