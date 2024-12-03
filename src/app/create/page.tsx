import { auth } from "@/auth";
import LoginRequiredWarning from "../_component/auth/LoginRequiredWarning";
import PurchaseCreator from "./_component/PurchaseCreator";
import getUserVendors from "../_loader/getUserVendors.loader";
import getUserItems from "../_loader/getUserItems.loader";
import getUserRole from "../_loader/getUserRole.loader";
import NotAllowedWarning from "../_component/auth/NotAllowedWarning";

export default async function Create() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const allowedRole: AvailableUserRole[] = ["admin", "manager", "staff"];
  const role = await getUserRole(session.user.userId);
  if (!allowedRole.includes(role)) return <NotAllowedWarning />;

  const vendorsInitialData = await getUserVendors(session.user.parentId);
  const itemsInitialData = await getUserItems(session.user.parentId);

  return (
    <>
      <PurchaseCreator
        initialVendors={vendorsInitialData}
        initialItems={itemsInitialData}
      />
    </>
  );
}
