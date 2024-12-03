import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { auth } from "@/auth";
import React from "react";
import PlanCreator from "./_component/PlanCreator";
import getUserItemsWithPrice from "@/app/_loader/getUserItemsWithLatestPrice";

export default async function Page() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const initialItemList = await getUserItemsWithPrice(session.user.parentId);

  return (
    <section className="max-w-md mx-auto">
      <div>Plan Creator Page</div>
      <PlanCreator initialItems={initialItemList} />
    </section>
  );
}
