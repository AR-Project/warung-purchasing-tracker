import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import getUserCategoryWithItemLatestPrice from "@/app/_loader/getUserCategoryWithItemLatestPrice";

import PlanCreator from "./_component/PlanCreator";

export default async function Page() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const initialData = await getUserCategoryWithItemLatestPrice(
    session.user.parentId
  );

  return (
    <section className="max-w-md mx-auto">
      <div className="bg-blue-900 p-2 ">Plan Creator Page</div>
      <PlanCreator availableData={initialData} />
    </section>
  );
}
