import { Metadata } from "next";

import { pageAuthAccess } from "@/lib/utils/auth";
import ChildUserCreator from "./_component/ChildUserCreator";
import { adminManagerRole } from "@/lib/const";

export const metadata: Metadata = {
  title: "WPT - Create New Staff",
};

export default async function Page() {
  const user = await pageAuthAccess(adminManagerRole)

  return (
    <main className=" max-w-md mx-auto flex flex-col gap-2">
      <h1 className="text-center text-2xl font-bold py-4 text-white">
        New Staff Form
      </h1>
      <ChildUserCreator userId={user.userId} />
      <p>Your role: {user.username}</p>
    </main>
  );
}
