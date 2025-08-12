"use client";

import { toast } from "react-toastify";

import { signInAction } from "@/app/_globalAction/signIn.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";
import { useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";

type SignInCredentials = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const [credentials, setCredentials] = useState<SignInCredentials>({
    username: "",
    password: "",
  });

  const [formAction, isPending] = useServerAction(
    signInAction,
    () => {
      // automatic refresh and redirect
    },
    (err) => {
      toast.error(err);
    }
  );

  return (
    <form action={formAction} className="relative flex flex-col gap-3 ">
      {isPending && <LoadingOverlay />}
      <div className="flex flex-col ">
        <input
          className="bg-gray-700 text-white p-2 rounded-md"
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, username: e.target.value }))
          }
          id="login-username"
          autoComplete="off"
          required
        />
      </div>
      <div className="flex flex-col ">
        <input
          className="bg-gray-700 text-white p-2 rounded-md"
          type="password"
          name="password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, password: e.target.value }))
          }
          id="login-username"
          placeholder="Password"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 p-2 text-lg rounded-sm border border-blue-800 font-bold disabled:bg-gray-500"
        disabled={isPending}
      >
        Login
      </button>
    </form>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute flex flex-col w-full h-full top-0 bg-gray-500/10 items-center justify-center backdrop-blur-xs">
      <div className="flex flex-row gap-2 justify-center">
        <LuLoaderCircle className="animate-spin text-2xl" />
        <div>Loading...</div>
      </div>
    </div>
  );
}
