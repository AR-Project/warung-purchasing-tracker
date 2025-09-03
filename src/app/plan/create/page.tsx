import { Metadata } from "next";

import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import getUserCategoryWithItemLatestPrice from "@/app/_loader/getUserCategoryWithItemLatestPrice";

import { allRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";

import PlanCreator from "./_component/PlanCreator";

export const metadata: Metadata = {
  title: "WPT - Plan Creator",
};

export default async function Page() {
  const [user, authError] = await verifyUserAccess(allRole);
  if (authError) return <LoginRequiredWarning />;

  const initialData = await getUserCategoryWithItemLatestPrice(user.parentId);

  return (
    <section className="max-w-md mx-auto w-full">
      <div className="bg-blue-900 p-2 ">Plan Creator Page</div>
      <PlanCreator availableData={initialData} />
    </section>
  );
}
