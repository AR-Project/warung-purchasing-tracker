"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MdPerson } from "react-icons/md";

import { SignOutButton } from "./SignOutButton";

type Props = {
  username: string;
  userId: string;
};

export default function UserInfo({ username, userId }: Props) {
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
        className="origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 flex flex-col bg-gray-500/70 border border-white/20 gap-1 backdrop-blur-sm p-3 pb-8 z-40 text-md  rounded-lg shadow-2xl "
      >
        <MenuItem as="div" className=" w-full flex flex-col items-end h-16">
          <div className="text-lg font-bold">Welcome, {username}!</div>
          <div className="text-xs text-white/50 ">{userId}</div>
        </MenuItem>
        <MenuItem as="div" className="w-full flex flex-col items-end h-15">
          <div className=" hover:underline text-md  h-8 cursor-pointer">
            Account Setting
          </div>
        </MenuItem>
        <MenuItem as="div" className=" w-full flex flex-row justify-end">
          <SignOutButton />
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
