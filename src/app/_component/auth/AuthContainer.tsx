import { auth } from "@/auth";
import LoginRegisterModal from "./LoginRegisterModal";
import UserInfo from "./UserInfo";
import getUserRole from "@/app/_loader/getUserRole.loader";

export default async function AuthContainer() {
  const session = await auth();

  const role = session ? await getUserRole(session.user.userId) : "undefined";

  return session ? (
    <UserInfo role={role} {...session.user} />
  ) : (
    <LoginRegisterModal />
  );
}
