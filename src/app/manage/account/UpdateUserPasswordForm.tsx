"use client";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { updateUserPassword } from "./_action/updateUserPassword.action";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

type RequestPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const defaultPayload: RequestPayload = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export default function UpdateUserPasswordForm() {
  const [error, setError] = useState<string>("");
  const [payload, setPayload] = useState<RequestPayload>(defaultPayload);

  const formRef = useRef<HTMLFormElement>(null);

  const [wrappedAction, isPending] = useServerAction(
    updateUserPassword,
    (msg, data) => {
      toast.success(JSON.stringify({ msg, data }));
      setPayload(defaultPayload);
    },
    (err) => {
      toast.error(err);
    }
  );

  const isNewPasswordValid = payload.newPassword === payload.confirmNewPassword;
  const isNewPasswordSameWithOld =
    payload.currentPassword === payload.newPassword;

  return (
    <form
      action={wrappedAction}
      className="flex flex-col gap-2 bg-white/10 p-4 rounded-lg"
      ref={formRef}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="current-password">Current password</label>
        <input
          className="bg-gray-800 text-white p-2 border border-white/30 rounded-md"
          value={payload.currentPassword}
          onChange={(e) =>
            setPayload((prev) => ({ ...prev, currentPassword: e.target.value }))
          }
          id="current-password"
          name="current-password"
          type="password"
          autoComplete="off"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="new-password">New password</label>
        <input
          className="bg-gray-800 text-white p-2 border border-white/30 rounded-md"
          value={payload.newPassword}
          onChange={(e) =>
            setPayload((prev) => ({ ...prev, newPassword: e.target.value }))
          }
          onBlur={() => {
            if (payload.confirmNewPassword.length === 0) return;
            if (isNewPasswordSameWithOld) {
              setError("Password Cannot be same with old one");
              return;
            }
            if (!isNewPasswordValid) setError("Password Not Match");
          }}
          onFocus={() => setError("")}
          id="new-password"
          name="new-password"
          type="password"
          autoComplete="off"
          required
        />
      </div>

      <div className="relative flex flex-col gap-1">
        <label htmlFor="confirm-new-password">Confirm new password</label>
        <input
          className="bg-gray-800 text-white p-2 border border-white/30 rounded-md"
          value={payload.confirmNewPassword}
          onChange={(e) =>
            setPayload((prev) => ({
              ...prev,
              confirmNewPassword: e.target.value,
            }))
          }
          onBlur={() => {
            if (!isNewPasswordValid) setError("Password Not Match");
          }}
          onFocus={() => setError("")}
          id="confirm-new-password"
          name="confirm-new-password"
          type="password"
          autoComplete="off"
          required
        />
        {error && (
          <div className="absolute bottom-0 translate-y-full text-red-400 italic text-sm py-2">
            {error}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-500 p-2 text-lg rounded-sm border border-blue-800 font-bold disabled:border-gray-700 disabled:bg-gray-500 mt-10 cursor-pointer disabled:cursor-not-allowed"
        disabled={!isNewPasswordValid || payload.currentPassword.length === 0}
      >
        Change password
      </button>
    </form>
  );
}
