"use client";

import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { useState } from "react";
import { MdPerson } from "react-icons/md";

import RegisterForm from "./form/RegisterForm";
import LoginForm from "./form/LoginForm";

export default function LoginRegisterModal() {
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
        className="border border-blue-600 flex flex-row items-center justify-center h-8 aspect-square  rounded-full hover:bg-blue-600/50 cursor-pointer"
      >
        <MdPerson className="text-2xl text-blue-600" />
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
              className="w-full max-w-xs rounded-md border border-gray-300/20 bg-gray-800 p-5 duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <LoginRegisterTabs />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export function LoginRegisterTabs() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  function selectTab(index: number) {
    setSelectedIndex(index);
  }

  return (
    <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
      <TabList className="flex flex-row gap-2 mb-3 border-b border-gray-500/50 pb-3">
        <Tab className="h-9 px-3 rounded-full data-[selected]:font-bold data-[selected]:text-white text-white/50 hover:bg-gray-50/30 data-[selected]:bg-blue-500">
          Login
        </Tab>
        <Tab className="h-9 px-3 rounded-full data-[selected]:font-bold data-[selected]:text-white text-white/50 hover:bg-gray-50/30 data-[selected]:bg-blue-500">
          Register
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <LoginForm />
        </TabPanel>
        <TabPanel>
          <RegisterForm onSuccess={() => selectTab(0)} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
