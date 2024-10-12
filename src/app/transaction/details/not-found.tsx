import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex w-full aspect-square flex-col justify-center items-center">
      <h2 className="text-lg font-bold">Transaksi tidak ditemukan</h2>
      <p>aw</p>
      <Link
        className="bg-blue-900 border-white/15 border h-10 px-3 flex flex-row items-center justify-center text-white/60 hover:underline"
        href="/transaction/purchase"
      >
        kembali ke halaman transaksi
      </Link>
    </div>
  );
}
