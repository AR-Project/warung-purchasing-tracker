import { Metadata } from "next";

import getUserCategoryWithItemLatestPrice from "@/app/_loader/getUserCategoryWithItemLatestPrice";
import { pageAuthAccess } from "@/lib/utils/auth";
import PlanCreator from "./_component/PlanCreator";

export const metadata: Metadata = {
  title: "WPT - Plan Creator",
};

export default async function Page() {
  const user = await pageAuthAccess()

  const initialData = await getUserCategoryWithItemLatestPrice(user.parentId);

  return (
    <section className="max-w-md mx-auto w-full">
      <div className="bg-blue-900 p-2 ">Plan Creator Page</div>
      <PlanCreator availableData={initialData} />
    </section>
  );
}
