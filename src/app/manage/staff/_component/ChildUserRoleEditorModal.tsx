"use client";

import { Button, Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import { MdEdit } from "react-icons/md";

import ChildUserRoleEditor from "./ChildUserRoleEditor";

type Props = {
  user: UserObject;
};

export default function ChildUserRoleEditorModal({ user }: Props) {
  let [isDialogOpen, setIsDialogOpen] = useState(false);

  function openDialog() {
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
  }

  return (
    <>
      <Button
        onClick={openDialog}
        className="border border-blue-600 flex flex-row items-center justify-center h-10 px-2 gap-2 rounded-sm hover:bg-blue-600/50 cursor-pointer"
      >
        <MdEdit className="text-2xl text-blue-600" /> Edit User
      </Button>
      <Dialog
        open={isDialogOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closeDialog}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-md border border-gray-300/20 bg-gray-800 p-5 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <ChildUserRoleEditor user={user} onClose={closeDialog} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
