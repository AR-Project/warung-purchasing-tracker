import { auth } from "@/auth";
import LoginRequiredWarning from "../_component/auth/LoginRequiredWarning";
import PurchaseCreator from "./_component/PurchaseCreator";

export default async function Create() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  return (
    <>
      <PurchaseCreator />
    </>
  );
}
