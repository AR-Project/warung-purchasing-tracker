import AuthContainer from "@/app/_component/auth/AuthContainer";
import { auth } from "@/auth";
import Link from "next/link";
import { MdHistory, MdReceiptLong } from "react-icons/md";

export async function Navigation() {
  const session = await auth();
  const links = [
    {
      href: "/create",
      label: "New",
      icon: <MdReceiptLong className="text-xl/3" />,
    },
    {
      href: "/transaction",
      label: "Activity",
      icon: <MdHistory className="text-xl/3" />,
    },
  ];

  return (
    <nav className="flex w-full max-w-md mx-auto p-0.5 flex-row gap-3 bg-transparent text-xs  justify-between items-center border-b border-white/20 px-1 bg-gray-500">
      <div className="flex flex-row gap-1">
        {session ? (
          links.map((link) => (
            <Link
              className="bg-blue-800 w-20 hover:bg-blue-500 p-1 flex flex-col justify-center items-center"
              key={link.href}
              href={link.href}
            >
              <div>{link.icon}</div>
              <div className="text-[0.5rem] font-light">{link.label}</div>
            </Link>
          ))
        ) : (
          <>Warung Purchasing Tracker v0.8</>
        )}
      </div>
      <AuthContainer />
    </nav>
  );
}
