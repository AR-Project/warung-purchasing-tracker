import { DisplaySingleItem } from "@/app/_component/DisplaySingleItem";
import {
  formatNumberToIDR,
  shortDateWithDay,
  stringToHourMinute,
} from "@/lib/utils/formatter";
import React from "react";

type Props = {
  plan: PurchasePlan;
};

export default function SinglePlanCard({ plan }: Props) {
  return (
    <a
      key={plan.id}
      className="flex flex-col bg-gray-700 h-fit rounded-xl overflow-clip w-full"
      href={`/plan/details/${plan.id}`}
    >
      <p className="p-2 py-2 bg-blue-700 ">
        {shortDateWithDay(plan.createdAt)} @{" "}
        {stringToHourMinute(plan.createdAt)}
      </p>
      <div className="flex flex-col gap-1 p-2">
        {plan.listOfPlanItem.map((row) => (
          <DisplaySingleItem key={row.id} item={row} disableLink />
        ))}
      </div>
      <p className="p-2 py-2 bg-blue-700 text-center">
        {formatNumberToIDR(plan.totalPrice)}
      </p>
    </a>
  );
}
