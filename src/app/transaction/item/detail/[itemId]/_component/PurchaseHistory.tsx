"use client";

import { formatNumberToIDR } from "@/lib/utils/formatter";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    purchaseId: string;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
    purchasedAt: string;
    quantity: number;
  }[];
};

export default function PurchaseHistory({ data }: Props) {
  const elementColor = "#737373";
  const mainColor = "#60a5fa";

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center font-bold">Jumlah Pembelian</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <Bar
            type="monotone"
            dataKey="quantity"
            stroke={mainColor}
            fill="#8884d8"
          />
          <CartesianGrid vertical={false} stroke={elementColor} />
          <XAxis dataKey="purchasedAt" stroke={elementColor} fontSize={12} />
          <YAxis
            dataKey="quantity"
            stroke={elementColor}
            fontSize={12}
            axisLine
          />
          <Tooltip
            formatter={(value, name, props) => [value, "Harga PerUnit"]}
          />
        </BarChart>
      </ResponsiveContainer>
      <h1 className="text-center font-bold">Harga Per Unit</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <Bar
            type="monotone"
            dataKey="pricePerUnit"
            stroke={mainColor}
            fill={`${mainColor}80`}
          />
          <CartesianGrid vertical={false} stroke={elementColor} />
          <XAxis dataKey="purchasedAt" stroke={elementColor} fontSize={12} />
          <YAxis
            dataKey="pricePerUnit"
            interval="preserveStartEnd"
            stroke={elementColor}
            fontSize={12}
            axisLine
            tickFormatter={(val) => formatNumberToIDR(val, "short")}
          />
          <Tooltip
            formatter={(value, name, props) => [value, "Harga PerUnit"]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
