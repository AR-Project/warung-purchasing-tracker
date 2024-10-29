import Link from "next/link";

import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { listOfItemsLoader } from "./_loader/listOfItem.loader";

export default async function Page() {
  const session = await auth();
  if (!session) {
    return <LoginRequiredWarning />;
  }

  const listOfItems = await listOfItemsLoader(session.user.parentId);

  return (
    <div className="flex flex-col gap-1 max-w-md mx-auto">
      {listOfItems.map((item) => (
        <Link
          className="h-10 px-3 bg-gray-700 hover:bg-gray-600 border border-gray-400 flex flex-row justify-start items-center"
          key={item.id}
          href={`./item/detail/${item.id}`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";
