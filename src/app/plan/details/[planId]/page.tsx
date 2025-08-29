import { notFound } from "next/navigation";
import { Metadata } from "next";

import { BackButton } from "@/app/_component/BackButton";

import SinglePlanCard from "../../_component/SinglePlanCard";
import { singlePlanLoader } from "./_loader/singlePlanLoader";
import PlanDeleteDialog from "./_component/PlanDeleteDialog";

type Params = { planId: string };

type Props = {
  params: Promise<Params>;
};

export const metadata: Metadata = {
  title: "WPT - Plan Details",
};

export default async function Page({ params }: Props) {
  const { planId } = await params;
  const singlePlan = await singlePlanLoader(planId);
  if (!singlePlan) return notFound();

  return (
    <div className="max-w-lg mx-auto p-1 flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 bg-gray-900">
        <BackButton /> Kembali
      </div>
      <h1 className="text-3xl text-center">{planId}</h1>
      <div className="max-w-xs mx-auto w-full">
        <SinglePlanCard plan={singlePlan} />
      </div>
      <div className="flex flex-row w-full max-w-xs justify-end mx-auto">
        <PlanDeleteDialog planId={planId} />
      </div>
    </div>
  );
}
