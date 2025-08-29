import { formatNumberToIDR } from "@/lib/utils/formatter";

type PurchaseHistory = {
  purchasedAt: string;
  quantity: number;
  vendorName: string;
  id: string;
  totalPrice: number;
  purchaseId: string;
  quantityInHundreds: number;
  pricePerUnit: number;
};

type Props = {
  purchaseHistories: PurchaseHistory[];
};

export default function PurchaseHistoryTable({ purchaseHistories }: Props) {
  const summary = purchaseHistories.reduce(
    (prev, curr) => {
      return {
        totalPrice: prev.totalPrice + curr.totalPrice,
        quantity: prev.quantity + curr.quantityInHundreds,
      };
    },
    { totalPrice: 0, quantity: 0 }
  );

  return (
    <table className="table-auto ">
      <thead className="">
        <tr className="*:p-2">
          <th>Tgl</th>
          <th>Vendor</th>
          <th className="text-right">Jumlah</th>
          <th className="text-right">Hrg.Satuan</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {purchaseHistories.map((row) => (
          <tr key={row.id} className="odd:bg-gray-800 *:p-2">
            <td>{row.purchasedAt}</td>
            <td>{row.vendorName}</td>
            <td className="text-right">
              {(row.quantityInHundreds / 100).toFixed(2)}
            </td>
            <td className="text-right">
              {formatNumberToIDR(row.pricePerUnit, "short")}
            </td>
            <td className="text-right">
              {formatNumberToIDR(row.totalPrice, "short")}
            </td>
          </tr>
        ))}
        <tr className="*:p-2 bg-blue-900 text-base">
          <td></td>
          <td></td>
          <td className="text-right">{(summary.quantity / 100).toFixed(2)}</td>

          <td className="text-right" colSpan={2}>
            {formatNumberToIDR(summary.totalPrice)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
