import Link from "next/link";
import { MdHistory, MdHome, MdReceiptLong } from "react-icons/md";
import { TbChecklist } from "react-icons/tb";

import LoginRegisterModal from "@/app/_component/auth/LoginRegisterModal";
import UserInfo from "@/app/_component/auth/UserInfo";
import { getUserRoleAuth } from "@/lib/utils/auth";

export async function Navigation() {
  const [userData] = await getUserRoleAuth();

  const links = [
    {
      href: "/",
      label: "Home",
      icon: <MdHome className="text-xl/3" />,
    },
    {
      href: "/create",
      label: "New",
      icon: <MdReceiptLong className="text-xl/3" />,
    },
    {
      href: "/plan",
      label: "Plan",
      icon: <TbChecklist className="text-xl/3" />,
    },
    {
      href: "/transaction",
      label: "Activity",
      icon: <MdHistory className="text-xl/3" />,
    },
  ];

  return (
    <nav className="flex w-full max-w-md mx-auto p-0.5 flex-row gap-3  text-xs  justify-between items-center border-b border-white/20 px-1 bg-gray-900">
      <div className="flex flex-row gap-1">
        {userData ? (
          links.map((link) => (
            <Link
              className="bg-blue-800 w-15 hover:bg-blue-500 p-1 flex flex-col justify-center items-center"
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
      {userData ? (
        <UserInfo
          userId={userData.userId}
          role={userData.role}
          username={userData.username}
        />
      ) : (
        <LoginRegisterModal />
      )}
    </nav>
  );
}

export const dynamic = "force-dynamic";
