import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { TbChecklist } from "react-icons/tb";
import { Metadata } from "next";

import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { allRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";

import { planLoader } from "./_loader/plan.loader";
import SinglePlanCard from "./_component/SinglePlanCard";

export const metadata: Metadata = {
  title: "WPT - Plan List",
};

export default async function Page() {
  const [user, authError] = await verifyUserAccess(allRole);
  if (authError) return <LoginRequiredWarning />;

  const planList = await planLoader(user.userId);

  return (
    <section className="flex flex-col gap-2 p-1 max-w-md mx-auto">
      <div className="flex flex-row justify-between max-w-md mx-auto items-center w-full bg-gradient-to-t from-blue-900/50 to-black mb-2 py-2">
        <div className=" font-black text-lg flex flex-row gap-2 ">
          <TbChecklist className="text-2xl" />
          <div>Plan List</div>
        </div>
        <Link
          className="bg-blue-950 p-1 px-2 border border-white/30 rounded-sm cursor-pointer flex flex-row gap-3 items-center hover:bg-blue-700"
          href="/plan/create"
        >
          <MdAdd
            className="text-
        2xl"
          />
          <div>New Plan</div>
        </Link>
      </div>
      {planList.length === 0 && (
        <div className="w-full max-w-xs mx-auto text-center py-32 rounded-lg border opacity-30 my-10">
          Plan kosong
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {planList.map((plan) => (
          <SinglePlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
