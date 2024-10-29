"use client";

import { LoginRegisterTabs } from "./LoginRegisterModal";

export default function NotAllowedWarning() {
  return (
    <main className="max-w-md mx-auto flex flex-col gap-3">
      <h1>Not Allowed</h1>
      <p>Your role level is not allowed to do this action</p>
    </main>
  );
}
