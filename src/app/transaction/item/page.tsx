import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { listOfItemsLoader } from "./_loader/listOfItem.loader";
import ListOfItem from "./_component/ListOfItem";

export default async function Page() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const listOfItems = await listOfItemsLoader(session.user.parentId);

  return (
    <div className="flex flex-col gap-1 max-w-md mx-auto">
      <ListOfItem items={listOfItems} />
    </div>
  );
}

export const dynamic = "force-dynamic";
