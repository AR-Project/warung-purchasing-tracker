import { MdLogout } from "react-icons/md";

import { signOutAction } from "@/app/_globalAction/signOut.action";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        className="bg-blue-800 h-10 flex flex-row gap-2 px-3 text-sm text-white/80 items-center border-white hover:bg-blue-600"
        type="submit"
      >
        <MdLogout className="text-2xl" /> Sign Out
      </button>
    </form>
  );
}
