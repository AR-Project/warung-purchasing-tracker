"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  MdCategory,
  MdImage,
  MdOutlineSettings,
  MdPerson,
} from "react-icons/md";

import { SignOutButton } from "./SignOutButton";
import Link from "next/link";

type Props = {
  username: string;
  userId: string;
  role: string;
};

/** A modal that displaying user management menu */
export default function UserInfo({ username, userId, role }: Props) {
  const allowedRole = ["admin", "manager"];
  const enableStaffManager = allowedRole.includes(role);

  return (
    <Menu>
      <MenuButton className=" bg-blue-900 flex flex-row items-center justify-center  rounded-full py-2 px-3 hover:bg-blue-600/50 cursor-pointer gap-2">
        <div className="p-0.5 rounded-full bg-white/50">
          <MdPerson className="text-xs text-white" />
        </div>
        <div>{username}</div>
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 flex flex-col bg-gray-500/70 border border-white/20 gap-1 backdrop-blur-sm p-2 z-40 text-md  rounded-lg shadow-2xl "
      >
        <MenuItem as="div" className=" w-full flex flex-col items-end h-16">
          <div className="text-lg font-bold">Welcome, {username}!</div>
          <div className="text-xs text-white/50 ">
            {userId} | {role}
          </div>
        </MenuItem>
        {enableStaffManager && (
          <MenuItem as="div" className="w-full flex flex-col items-end h-15">
            {({ close }) => (
              <Link
                href="/manage/staff"
                onClick={close}
                className=" hover:underline text-md  h-8 cursor-pointer flex flex-row items-center gap-2 justify-between w-full hover:bg-white/20 p-2 rounded-sm"
              >
                <MdPerson className="text-white" /> Manage Staff
              </Link>
            )}
          </MenuItem>
        )}
        <MenuItem as="div" className="w-full flex flex-col items-end h-15">
          {({ close }) => (
            <Link
              href="/manage/category"
              onClick={close}
              className=" hover:underline text-md  h-8 cursor-pointer flex flex-row items-center gap-2 justify-between w-full hover:bg-white/20 p-2 rounded-sm"
            >
              <MdCategory className="text-white" /> Item Category
            </Link>
          )}
        </MenuItem>
        <MenuItem as="div" className="w-full flex flex-col items-end h-15">
          {({ close }) => (
            <Link
              href="/manage/media"
              onClick={close}
              className=" hover:underline text-md  h-8 cursor-pointer flex flex-row items-center gap-2 justify-between w-full hover:bg-white/20 p-2 rounded-sm"
            >
              <MdImage className="text-white" /> Manage Media
            </Link>
          )}
        </MenuItem>

        <MenuItem as="div" className="w-full flex flex-col items-end h-15">
          {({ close }) => (
            <Link
              href="/manage"
              onClick={close}
              className=" hover:underline text-md h-8 cursor-pointer flex flex-row items-center gap-2 justify-between w-full hover:bg-white/20 p-2 rounded-sm"
            >
              <MdOutlineSettings className="text-white" /> Account Settings
            </Link>
          )}
        </MenuItem>
        <MenuItem as="div" className=" w-full flex flex-row justify-end mt-4">
          <SignOutButton />
        </MenuItem>
        <div className="mt-4 border-t py-3">
          <div className="text-xs/3 italic text-white/70 text-center">
            Warung Purchasing Tracker
          </div>
          <div className="text-xs/3 italic text-white/50 text-center">
            AR PRocjet © 2024
          </div>
        </div>
      </MenuItems>
    </Menu>
  );
}
