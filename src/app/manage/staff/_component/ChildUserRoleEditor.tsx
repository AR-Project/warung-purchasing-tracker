"use client";

import { Select } from "@headlessui/react";
import { useRef, useState } from "react";
import { PiCaretDoubleRightBold } from "react-icons/pi";
import { toast } from "react-toastify";

import { useServerAction } from "@/presentation/hooks/useServerAction";
import { updateUserRole } from "../_action/updateUserRole.action";
import { updateUserUsername } from "../_action/updateUserUsername.action";

type Props = {
  user: UserObject;
  onClose?: () => void;
};

export default function ChildUserRoleEditor({
  user,
  onClose = () => {},
}: Props) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  const [newUsername, setNewUsername] = useState<string>(user.username);

  const isRoleChanged = user.role !== selectedRole;
  const isUsernameChanged = user.username !== newUsername;

  const roleSelectRef = useRef<HTMLSelectElement>(null);
  const newUsernameInputRef = useRef<HTMLInputElement>(null);

  const roleOptions = [
    {
      value: "manager",
      placeholder: "Manager",
    },
    {
      value: "staff",
      placeholder: "Staff",
    },
    {
      value: "guest",
      placeholder: "Guest",
    },
  ];

  const [changeUserRoleAction] = useServerAction(
    updateUserRole,
    (msg) => toast.success(msg),
    (err) => toast.error(err)
  );

  const [changeUsernameAction] = useServerAction(
    updateUserUsername,
    (msg) => toast.success(msg),
    (err) => toast.error(err)
  );

  return (
    <div className="flex flex-col w-full gap-8">
      <h1 className="font-bold mb-2 text-2xl border-b border-white/10">
        Edit Staff Info
      </h1>
      <form
        className="flex flex-col w-full gap-2"
        action={changeUserRoleAction}
      >
        <input type="hidden" name="child-user-id" value={user.id} />
        <div>Change role to:</div>
        <div className="flex flex-row w-full justify-between items-center p-2 border border-gray-600">
          <div
            onClick={() => roleSelectRef.current?.showPicker()}
            className="italic text-white/70 bg-black h-10 px-5 flex flex-row items-center w-32"
          >
            {user.role}
          </div>
          <PiCaretDoubleRightBold className="text-xl" />
          <div className="flex flex-row gap-2">
            <Select
              ref={roleSelectRef}
              name="new-role"
              className="bg-gray-600 h-10 px-3 w-36"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.placeholder}
                </option>
              ))}
            </Select>
            <button
              className="bg-green-700 disabled:bg-green-700/20 disabled:text-white/20 disabled:cursor-not-allowed h-10 px-2 text-sm "
              disabled={!isRoleChanged}
            >
              Save
            </button>
          </div>
        </div>
      </form>
      <form
        className="flex flex-col w-full gap-1"
        action={changeUsernameAction}
      >
        <input type="hidden" name="child-user-id" value={user.id} />
        <div>Change username to:</div>
        <div className="flex flex-row w-full justify-between items-center p-2 border border-gray-600">
          <div
            onClick={() => newUsernameInputRef.current?.focus()}
            className="italic text-white/70 bg-black h-10 px-5 flex flex-row items-center font-mono w-32"
          >
            {user.username}
          </div>
          <PiCaretDoubleRightBold className="text-xl" />
          <div className="flex flex-row gap-2">
            <input
              ref={newUsernameInputRef}
              name="new-username"
              className="bg-gray-600 h-10 px-3 w-36 flex font-mono "
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <button
              className="bg-green-700 disabled:bg-green-700/20 disabled:text-white/20 disabled:cursor-not-allowed h-10 px-2 text-sm "
              disabled={!isUsernameChanged}
            >
              Save
            </button>
          </div>
        </div>
      </form>
      <button onClick={() => onClose()}>Tutup</button>
    </div>
  );
}
