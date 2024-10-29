"use client";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { Select } from "@headlessui/react";
import { createChildUser } from "../_action/createChildUser.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

function ChildUserCreator({ userId }: Props) {
  const router = useRouter();

  const [createChildUserAction] = useServerAction(
    createChildUser,
    (msg, err) => {
      toast.success(msg);
      router.replace("/manage/staff");
    },
    (err) => toast.error(err)
  );

  return (
    <form className=" flex flex-col gap-3" action={createChildUserAction}>
      <input type="hidden" name="user-id" value={userId} />
      <input
        className="bg-gray-800 text-white border border-gray-400 h-10 px-2"
        type="text"
        name="username"
        placeholder="Username"
      />
      <input
        className="bg-gray-800 text-white border border-gray-400 h-10 px-2"
        type="text"
        name="password"
        placeholder="Password"
      />
      <input
        className="bg-gray-800 text-white border border-gray-400 h-10 px-2"
        type="text"
        name="confirm-password"
        placeholder="Ulangi Password"
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor="createStaffRole">Select Role:</label>
        <Select
          name="role"
          id="create-staff-role"
          className="border data-[hover]:shadow data-[focus]:bg-blue-100 bg-gray-800 h-10 px-2"
          aria-label="Project status"
        >
          <option className="font-sans h-10" value="manager">
            Manager
          </option>
          <option className="font-sans h-10" value="guest">
            Guest
          </option>
          <option className="font-sans h-10" value="staff">
            Staff
          </option>
        </Select>{" "}
      </div>
      <button
        className="bg-blue-900 hover:underline hover:bg-blue-500 h-10 px-3 w-fit flex flex-row items-center rounded-sm border border-blue-700"
        type="submit"
      >
        Buat User Baru
      </button>
    </form>
  );
}

export default ChildUserCreator;
