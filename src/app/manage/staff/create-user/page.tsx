import React from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import getUserRole from "@/app/_loader/getUserRole.loader";
import NotAllowedWarning from "@/app/_component/auth/NotAllowedWarning";
import ChildUserCreator from "./_component/ChildUserCreator";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/");

  const role = await getUserRole(session.user.userId);
  const allowedRole: AvailableUserRole[] = ["admin", "manager"];
  if (!allowedRole.includes(role)) return <NotAllowedWarning />;

  return (
    <main className=" max-w-md mx-auto flex flex-col gap-2">
      <h1 className="text-center text-2xl font-bold py-4 text-white">
        New Staff Form
      </h1>
      <ChildUserCreator userId={session.user.userId} />
      <p>Your role: {role}</p>
    </main>
  );
}
