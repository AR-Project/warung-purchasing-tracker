import { Metadata } from "next";
import { LoginRegisterTabs } from "../_component/auth/LoginRegisterModal";

export const metadata: Metadata = {
  title: "WPT - Login",
};

export default function Page() {
  return (
    <div className="w-full max-w-md mx-auto p-5 py-10">
      {/* <LoginForm /> */}
      <LoginRegisterTabs />

    </div>
  );
}
