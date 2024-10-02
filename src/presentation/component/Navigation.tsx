import Link from "next/link";

export function Navigation() {
  const links = [
    {
      href: "/create",
      label: "Create",
    },
    {
      href: "/transaction",
      label: "Transaction",
    },
    {
      href: "/library",
      label: "Library",
    },
  ];

  return (
    <nav className="flex flex-row gap-3 bg-transparent text-xs items-stretch  justify-center border-b border-white/20 p-3 bg-gray-500">
      {links.map((link) => (
        <Link
          className="uppercase bg-blue-800 p-2 hover:bg-blue-500"
          key={link.href}
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
