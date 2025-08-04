import { MdCategory } from "react-icons/md";

import ManageCategoryNavigation from "./_component/CategoryNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-row w-full items-center justify-center gap-3 p-2">
        <MdCategory className="text-blue-600 text-xl" />
        Category Management
      </div>
      <ManageCategoryNavigation />
      {children}
    </>
  );
}
