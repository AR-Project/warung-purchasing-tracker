import AuthContainer from "@/app/_component/auth/AuthContainer";
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
    <nav className="flex w-full max-w-md mx-auto flex-row gap-3 bg-transparent text-xs  justify-between items-center border-b border-white/20 px-1 h-14 bg-gray-500">
      <div className="flex flex-row gap-2">
        {links.map((link) => (
          <Link
            className="uppercase bg-blue-800 p-2 hover:bg-blue-500"
            key={link.href}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <AuthContainer />
    </nav>
  );
}
