"use client";

import LoginForm from "./form/LoginForm";
import { LoginRegisterTabs } from "./LoginRegisterModal";

export default function LoginRequiredWarning() {
  return (
    <main className="max-w-md mx-auto flex flex-col gap-3">
      <LoginRegisterTabs />
    </main>
  );
}
