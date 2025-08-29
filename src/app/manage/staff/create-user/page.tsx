import { redirect } from "next/navigation";
import { Metadata } from "next";

import NotAllowedWarning from "@/app/_component/auth/NotAllowedWarning";
import { verifyUserAccess } from "@/lib/utils/auth";
import ChildUserCreator from "./_component/ChildUserCreator";

export const metadata: Metadata = {
  title: "WPT - Create New Staff",
};

export default async function Page() {
  const [userSession, error] = await verifyUserAccess(["admin", "manager"]);

  if (error) {
    if (error == "not_authenticated") redirect("/");
    return <NotAllowedWarning />;
  }

  return (
    <main className=" max-w-md mx-auto flex flex-col gap-2">
      <h1 className="text-center text-2xl font-bold py-4 text-white">
        New Staff Form
      </h1>
      <ChildUserCreator userId={userSession.userId} />
      <p>Your role: {userSession.username}</p>
    </main>
  );
}
