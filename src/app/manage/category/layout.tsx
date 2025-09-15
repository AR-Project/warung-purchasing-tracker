import { MdCategory } from "react-icons/md";

import ManageCategoryNavigation from "./_component/CategoryNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-row w-full items-center justify-center gap-3 p-3 mt-2 bg-gradient-to-t from-blue-900/50 to-black mb-2 max-w-md mx-auto">
        <MdCategory className="text-blue-600 text-xl" />
        Category Management
      </div>
      <ManageCategoryNavigation />
      {children}
    </>
  );
}
