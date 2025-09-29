"use client"

import dynamic from "next/dynamic"
import { ImSpinner5 } from "react-icons/im";

import { ItemSortOrderEditorProps } from "./ItemSortOrderEditor";

const ItemSortOrderEditor = dynamic(() => import("./ItemSortOrderEditor"), { ssr: false, loading: () => <LoadingScreen /> })


export default function ItemSortOrderEditorClient(props: ItemSortOrderEditorProps) {
  return <ItemSortOrderEditor {...props} />
}

function LoadingScreen() {
  return (
    <div className=" h-48 w-full flex flex-col items-center justify-center animate-pulse bg-gray-900 gap-3">
      <ImSpinner5 className="animate-spin text-3xl/tight mb-4" />
      <div>Memuat...</div>
    </div>
  );
}
