"use client";

import { toast } from "react-toastify";

import { loginUserAction } from "@/app/_globalAction/loginUser.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";

export default function LoginForm() {
  const [formAction] = useServerAction(
    loginUserAction,
    () => {},
    (err) => {
      toast.error(err);
    }
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col ">
        <input
          className="bg-gray-700 text-white p-2 rounded-md"
          type="text"
          name="username"
          placeholder="Username"
          id="login-username"
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col ">
        <input
          className="bg-gray-700 text-white p-2 rounded-md"
          type="password"
          name="password"
          id="login-username"
          placeholder="Password"
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
