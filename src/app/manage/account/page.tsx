import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { ReactNode } from "react";

import { getUserRoleAuth } from "@/lib/utils/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";

import UpdateUserPasswordForm from "./UpdateUserPasswordForm";
import UpdateUserUsernameForm from "./UpdateUserUsernameForm";

export default async function Page() {
  const [userSession, error] = await getUserRoleAuth();

  if (error !== null) {
    return <LoginRequiredWarning />;
  }

  return (
    <div className="w-full max-w-md mx-auto py-5 ">
      <div className="text-center font-black text-xl pb-3 mb-5 border-b border-white/10  bg-gradient-to-t from-blue-900/20 to-black">
        Pengaturan Akun
      </div>
      <TabGroup>
        <TabList className="flex gap-4">
          <TabButton tabKey="profile">Umum</TabButton>
          <TabButton tabKey="password">Ubah Password</TabButton>
        </TabList>
        <TabPanels className="mt-3">
          <TabPanel key="profile" className="rounded-xl bg-white/5 p-3">
            <UpdateUserUsernameForm />
            <div>Change Default Category</div>
          </TabPanel>
          <TabPanel
            key="password"
            className="rounded-xl p-3 flex flex-col gap-4"
          >
            <UpdateUserPasswordForm />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

function TabButton({
  tabKey,
  children,
}: {
  tabKey: string;
  children: ReactNode;
}) {
  return (
    <Tab
      key={tabKey}
      className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 cursor-pointer"
    >
      {children}
    </Tab>
  );
}
