"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Links = {
  href: string;
  tag: string;
  label: string;
};

export default function ManageCategoryNavigation() {
  const path = usePathname();

  const links: Links[] = [
    {
      href: "/manage/category",
      tag: "manage",
      label: "Manage",
    },
    {
      href: "/manage/category/edit-order",
      tag: "order",
      label: "Change Order",
    },
    {
      href: "/manage/category/delete",
      tag: "delete",
      label: "Remove",
    },
  ];

  return (
    <div className="flex flex-row gap-2 mb-4 text-sm max-w-md mx-auto my-3 pb-3 border-b-2 border-white/10">
      {links.map((link) => (
        <Link
          className={`rounded-full h-8 flex flex-row justify-center items-center italic ${
            path == link.href
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
