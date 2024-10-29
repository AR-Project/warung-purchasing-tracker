import Link from "next/link";
import { MdPerson } from "react-icons/md";

import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { auth } from "@/auth";
import getUserChildren from "./_loader/getUserChild.loader";
import DeleteUserHiddenForm from "./_component/DeleteUserHiddenForm";

export default async function Page() {
  const session = await auth();
  if (!session) {
    return <LoginRequiredWarning />;
  }

  const [error, user] = await getUserChildren(session.user.userId);

  if (error) {
    return <>{error}</>;
  }

  return (
    <main className="flex flex-col gap-2 max-w-md mx-auto">
      <h1 className="font-bold text-xl text-center pt-2 pb-4">Manage Staff</h1>
      {user &&
        user.map((user) => (
          <div
            key={user.id}
            className="flex flex-row justify-between items-center bg-gray-800/60 hover:bg-gray-800 p-2"
          >
            <div className="flex flex-row gap-2 items-center  ">
              <MdPerson className="text-white text-4xl" />
              <div className="flex flex-col">
                <div className="text-lg/6 font-medium">{user.username}</div>
                <div className="text-xs/3 italic text-white/50">
                  {user.role}
                </div>
              </div>
            </div>
            <DeleteUserHiddenForm userIdToDelete={user.id} />
          </div>
        ))}
      <Link
        href="/manage/staff/create-user"
        className="bg-blue-900 hover:underline hover:bg-blue-500 h-10 px-3 w-fit flex flex-row items-center rounded-sm border border-blue-700"
      >
        Create New Staff
      </Link>
    </main>
  );
}
