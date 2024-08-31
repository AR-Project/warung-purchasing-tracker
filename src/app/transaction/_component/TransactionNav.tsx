"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Links = {
  href: string;
  label: string;
};

export default function TransactionNavigation() {
  const path = usePathname();

  const links: Links[] = [
    {
      href: "/transaction/purchase",
      label: "By Purchase",
    },
    {
      href: "/transaction/items",
      label: "By Item",
    },
    {
      href: "/transaction/grouped",
      label: "By Grouped Items",
    },
  ];

  return (
    <div className="flex flex-row gap-2 mb-4 text-sm">
      {links.map((link) => (
        <Link
          className={`rounded-full py-1.5 ${
            path === link.href
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
