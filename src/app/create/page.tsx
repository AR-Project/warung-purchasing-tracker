import { Metadata } from "next";

import { pageAuthAccess } from "@/lib/utils/auth";
import { adminManagerStaffRole } from "@/lib/const";

import getUserVendors from "../_loader/getUserVendors.loader";
import getUserItems from "../_loader/getUserItems.loader";

import PurchaseCreatorClient from "./PurchaseCreatorClient";

export const metadata: Metadata = {
  title: "WPT - Create Purchase",
};

export default async function Create() {
  const user = await pageAuthAccess(adminManagerStaffRole)

  const vendorsInitialData = await getUserVendors(user.parentId);
  const itemsInitialData = await getUserItems(user.parentId);

  return (
    <PurchaseCreatorClient
      initialVendors={vendorsInitialData}
      initialItems={itemsInitialData}
    />
  );
}
