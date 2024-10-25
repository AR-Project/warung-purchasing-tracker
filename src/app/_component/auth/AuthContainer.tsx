import { auth } from "@/auth";
import LoginRegisterModal from "./LoginRegisterModal";
import UserInfo from "./UserInfo";

export default async function AuthContainer() {
  const session = await auth();

  return session ? <UserInfo {...session.user} /> : <LoginRegisterModal />;
}
