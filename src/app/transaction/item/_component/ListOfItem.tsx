"use client";

import { useState } from "react";
import Link from "next/link";

import useList from "@/presentation/hooks/useList";

type Item = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
};

type Props = {
  items: Item[];
};

type SplittedItems = {
  zeroPurchase: Item[];
  nonZeroPurchase: Item[];
};

export default function ListOfItem({ items }: Props) {
  const { filteredList, search } = useList("", items);
  const [query, setQuery] = useState<string>("");

  const splittedItems = filteredList.reduce<SplittedItems>(
    (bag, currentItem) => {
      if (currentItem.quantity === 0) {
        bag.zeroPurchase.push(currentItem);
      } else {
        bag.nonZeroPurchase.push(currentItem);
      }
      return bag;
    },
    { zeroPurchase: [], nonZeroPurchase: [] }
  );

  return (
    <div className="flex flex-col">
      <input
        type="text"
        className="text-white bg-gray-800 h-10 px-2 mt-2 mb-6 "
        placeholder="🔍 Cari Nama Barang..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
      />
      <h1>Purchased Item</h1>
      <div className="grid grid-cols-2 gap-1">
        {splittedItems.nonZeroPurchase.map((item) => (
          <ItemLinkCard key={item.id} item={item} />
        ))}
      </div>
      <h1>Item with no purchase</h1>
      <div className="grid grid-cols-2 gap-1">
        {splittedItems.zeroPurchase.map((item) => (
          <ItemLinkCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

type ItemLinkCardProps = {
  item: Item;
};

function ItemLinkCard({ item }: ItemLinkCardProps) {
  return (
    <Link
      className="h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 flex flex-row gap-1 justify-start items-start text-sm"
      key={item.id}
      href={`./item/detail/${item.id}`}
    >
      <div className="relative h-10 aspect-square bg-gray-600">
        <div className="absolute bottom-0 right-0 font-black  px-0.1">
          {item.quantity}
        </div>
      </div>
      <div>
        <div className="text-xs/3 italic opacity-35 font-light">
          {item.category || "uncategorized"}
        </div>
        <div>{item.name}</div>
      </div>
    </Link>
  );
}
