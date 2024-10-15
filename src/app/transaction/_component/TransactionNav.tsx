"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Links = {
  href: string;
  tag: string;
  label: string;
};

export default function TransactionNavigation() {
  const path = usePathname();

  const links: Links[] = [
    {
      href: "/transaction/purchase",
      tag: "purchase",
      label: "By Purchase",
    },
    {
      href: "/transaction/item",
      tag: "item",
      label: "By Item",
    },
  ];

  return (
    <div className="flex flex-row gap-2 mb-4 text-sm max-w-md mx-auto">
      {links.map((link) => (
        <Link
          className={`rounded-full h-8 flex flex-row justify-center items-center italic ${
            path.includes(link.tag)
              ? "bg-sky-600 hover:bg-sky-500 "
              : "bg-blue-900 hover:bg-blue-800"
          } border border-gray-500  px-4 w-fit hover:border-gray-200  `}
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
