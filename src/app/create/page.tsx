import { auth } from "@/auth";
import AddTransaction from "./_component/AddTransaction";
import LoginRequiredWarning from "../_component/auth/LoginRequiredWarning";

export default async function Create() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  return (
    <>
      <AddTransaction />
    </>
  );
}
