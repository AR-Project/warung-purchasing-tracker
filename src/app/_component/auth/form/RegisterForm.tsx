"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { createUserAction } from "@/app/_globalAction/createUser.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";

type Props = {
  onSuccess?: () => void;
};

type SignInCredentials = {
  username: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm({ onSuccess = () => {} }: Props) {
  const [err, setErr] = useState("");
  const [credentials, setCredentials] = useState<SignInCredentials>({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [formAction, isPending] = useServerAction(
    createUserAction,
    (msg) => {
      onSuccess();
      toast.success(msg);
    },
    (err) => toast.error(err)
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap">
        <input
          className="bg-gray-700 text-white p-2 rounded-sm"
          type="text"
          name="username"
          placeholder="Username"
          id="register-username"
          min={3}
          value={credentials.username}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, username: e.target.value }))
          }
          required
        />
      </div>
      <div className="flex flex-col gap">
        <input
          className="bg-gray-700 text-white p-2 rounded-sm"
          type="password"
          name="password"
          placeholder="Password"
          id="register-pasword"
          value={credentials.password}
          onChange={(e) =>
            setCredentials((prev) => ({ ...prev, password: e.target.value }))
          }
          required
        />
      </div>
      <div className="flex flex-col gap">
        <input
          className="bg-gray-700 text-white p-2 rounded-sm"
          type="password"
          name="confirm-password"
          placeholder="Confirm Password"
          id="register-confirm-password"
          value={credentials.confirmPassword}
          onChange={(e) => {
            setCredentials((prev) => ({
              ...prev,
              confirmPassword: e.target.value,
            }));
          }}
          onBlur={() => {
            if (credentials.password !== credentials.confirmPassword) {
              setErr("Password Is Not Match");
            } else {
              setErr("");
            }
          }}
          onFocus={() => setErr("")}
          required
        />
      </div>
      <div>{err}</div>
      <button
        type="submit"
        className="bg-blue-500 p-2 text-lg rounded-sm border border-blue-800 font-bold disabled:bg-gray-500"
        disabled={isPending}
      >
        Daftar
      </button>
    </form>
  );
}
