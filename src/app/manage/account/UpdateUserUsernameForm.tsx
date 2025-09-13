"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import clsx from "clsx";
import { ImCheckmark, ImCross } from "react-icons/im";
import { LuLoaderCircle } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";

import { useServerAction } from "@/presentation/hooks/useServerAction";

import { updateUserUsername } from "./_action/updateUserUsername.action";
import { validateUsernameAction } from "./_action/validateUserName.action";

type UsernameStatus = "empty" | "waiting" | "unavailable" | "error" | "ok";

const regex = /^[a-zA-Z0-9._]+$/;

export default function UpdateUserUsernameForm() {
  const router = useRouter();
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("empty");
  const [newUsername, setNewUsername] = useState<string>("");
  const [newUsernameDebounce, setNewUsernameDebounce] = useDebounceValue(
    "",
    1000
  );

  const currentPath = usePathname();

  const [wrappedUpdateUsername, isPending] = useServerAction(
    updateUserUsername,
    (msg, data) => {
      toast.success(JSON.stringify({ msg, data }));
      setNewUsername("");
      setUsernameStatus("empty");
      setNewUsernameDebounce("");
      router.refresh();
    },
    (err) => {
      toast.error(err);
    }
  );

  const [wrappedValidateAction] = useServerAction(
    validateUsernameAction,
    () => setUsernameStatus("ok"),
    () => setUsernameStatus("unavailable")
  );

  useEffect(() => {
    if (newUsernameDebounce.length === 0) return;
    if (!regex.test(newUsernameDebounce)) {
      setUsernameStatus("error");
      return;
    }
    (() => {
      const formData = new FormData();
      formData.set("check-username", newUsernameDebounce);
      wrappedValidateAction(formData);
    })();
  }, [newUsernameDebounce]);

  return (
    <form
      action={wrappedUpdateUsername}
      className="flex flex-col gap-2 bg-white/10 p-4 rounded-lg"
    >
      <input type="hidden" name="current-path" value={currentPath} />
      <div className="relative flex flex-col gap-1">
        <label htmlFor="new-username">New Username</label>
        <div className="relative flex flex-row items-center">
          <input
            className={clsx(
              "bg-gray-800 text-white p-2 border rounded-md w-full",
              "data-[state=ok]:border-green-500/50 data-[state=ok]:ring-green-500/30 data-[state=ok]:ring-2 data-[state=ok]:bg-green-950/50",
              "data-[state=error]:border-red-500/30 data-[state=error]:ring-red-500/30 data-[state=error]:ring-2 data-[state=error]:bg-red-950/50",
              "data-[state=unavailable]:border-red-500/30 data-[state=unavailable]:ring-red-500/30 data-[state=unavailable]:ring-2 data-[state=unavailable]:bg-red-950/50",
              "data-[state=waiting]:border-white-500/30 data-[state=waiting]:bg-gray-800",
              "data-[state=empty]:border-white-500/30 data-[state=empty]:bg-gray-800"
            )}
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
              if (e.target.value.length >= 4) {
                setUsernameStatus("waiting");
                setNewUsernameDebounce(e.target.value);
              } else {
                setUsernameStatus("empty");
                setNewUsernameDebounce("");
              }
            }}
            id="new-username"
            name="new-username"
            type="text"
            autoComplete="off"
            required
            data-state={usernameStatus}
          />
          <div className="absolute right-0 p-2 text-xl">
            {usernameStatus === "waiting" && (
              <LuLoaderCircle className="animate-spin " />
            )}
            {usernameStatus === "ok" && (
              <ImCheckmark className="text-green-500" />
            )}
            {usernameStatus === "unavailable" && (
              <ImCross className="text-red-500" />
            )}
          </div>
        </div>
        {usernameStatus === "error" && (
          <div className="absolute bottom-0 translate-y-full italic text-sm py-1">
            Username hanya boleh huruf, angka, garis bawah dan titik
          </div>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-500 p-2 text-lg rounded-sm border border-blue-800 font-bold disabled:border-gray-700 disabled:bg-gray-500 mt-10 cursor-pointer disabled:cursor-not-allowed"
        disabled={!(usernameStatus === "ok")}
      >
        {isPending ? "Menyimpan..." : "Ganti Username"}
      </button>
    </form>
  );
}
