"use client";

import { toast } from "react-toastify";

import { registerUserAction } from "@/app/_globalAction/registerUser.action";
import { useServerAction } from "@/presentation/hooks/useServerAction";

type Props = {
  onSuccess?: () => void;
};

export default function RegisterForm({ onSuccess = () => {} }: Props) {
  const [formAction] = useServerAction(
    registerUserAction,
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
          required
        />
      </div>
      <button type="submit">Daftar</button>
    </form>
  );
}
