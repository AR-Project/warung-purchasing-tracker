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
  ];

  return (
    <nav className="flex flex-row gap-3 bg-transparent text-xs items-stretch  justify-center  mb-10 p-3 bg-gray-500">
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
