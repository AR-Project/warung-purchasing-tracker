import { verifyUserAccess } from "@/lib/utils/auth";

import LoginRequiredWarning from "../_component/auth/LoginRequiredWarning";
import getUserVendors from "../_loader/getUserVendors.loader";
import getUserItems from "../_loader/getUserItems.loader";
import NotAllowedWarning from "../_component/auth/NotAllowedWarning";
import { Metadata } from "next";
import PurchaseCreatorClient from "./PurchaseCreatorClient";

export const metadata: Metadata = {
  title: "WPT - Create Purchase",
};

export default async function Create() {
  const [userInfo, verifyError] = await verifyUserAccess([
    "admin",
    "manager",
    "staff",
  ]);
  if (verifyError !== null) {
    if (verifyError === "not_authenticated") {
      return <LoginRequiredWarning />;
    } else if (verifyError === "not_authorized") {
      return <NotAllowedWarning />;
    } else return <>internal Error</>;
  }

  const vendorsInitialData = await getUserVendors(userInfo.parentId);
  const itemsInitialData = await getUserItems(userInfo.parentId);

  return (
    <PurchaseCreatorClient
      initialVendors={vendorsInitialData}
      initialItems={itemsInitialData}
    />
  );
}
