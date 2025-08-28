"use client";

import Link from "next/link";
import { MdDownload } from "react-icons/md";

type Props = {
  range: RangeFilter | undefined;
};

export default function ExportButton({ range }: Props) {
  const params = new URLSearchParams();

  if (range) {
    params.set("from", range.from);
    params.set("to", range.to);
  }

  return (
    <Link href={`/api/export${range ? `?${params.toString()}` : ""}`}>
      <button className="bg-blue-950 p-1 px-2 border border-white/30 rounded-sm cursor-pointer flex flex-row gap-3 items-center hover:bg-blue-700">
        <MdDownload className="text-lg" />
        <div className="text-sm">Download </div>
      </button>
    </Link>
  );
}
