"use client";

import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { deleteUser } from "../_action/deleteUser.action";

type Props = {
  userIdToDelete: string;
};

export default function DeleteUserHiddenForm({ userIdToDelete }: Props) {
  const [formAction] = useServerAction(
    deleteUser,
    (msg, err) => {
      toast.success(msg);
    },
    (err) => toast.error(err)
  );

  return (
    <form action={formAction}>
      <input
        type="hidden"
        id="user-id-to-delete"
        name="user-id-to-delete"
        value={userIdToDelete}
      />
      <button
        type="submit"
        className="bg-black rounded-sm text-red-600 border border-red-800 h-10 px-3 flex flex-row justify-center items-center "
      >
        <MdDelete className="text-xl" />
        <div className="text-sm">Delete User</div>
      </button>
    </form>
  );
}
