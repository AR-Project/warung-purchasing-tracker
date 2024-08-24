import Link from "next/link";

type Links = {
  href: string;
  label: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links: Links[] = [
    {
      href: "/transaction",
      label: "By Purchase",
    },
    {
      href: "/transaction/items",
      label: "By Item",
    },
    {
      href: "/transaction/items/grouped",
      label: "By Grouped Items",
    },
  ];

  return (
    <section>
      <div className="flex flex-row gap-2 mb-4 text-sm">
        {links.map((link) => (
          <Link
            className="rounded-full py-1.5 bg-blue-900 border border-gray-500  px-3 w-fit hover:bg-blue-800"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
        {/* 
        <Link
          className="rounded-full bg-blue-700 border border-gray-500 py-2 px-3 w-fit hover:bg-blue-500"
          href={"/transaction/items"}
        >
          By Items
        </Link>
        <Link
          className="rounded-full bg-blue-700 border border-gray-500 py-2 px-3 w-fit hover:bg-blue-500"
          href={"/transaction/items/grouped"}
        >
          By Grouped Items
        </Link> */}
      </div>
      {children}
    </section>
  );
}
