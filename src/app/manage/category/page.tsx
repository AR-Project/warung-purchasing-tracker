import Link from "next/link";
import { Metadata } from "next";

import { adminManagerStaffRole } from "@/lib/const";
import EditCategoryModal from "./_component/EditCategoryModal";
import CreateCategoryModal from "./_component/CreateCategoryModal";
import categoriesLoader from "./_loader/category.loader";
import { pageAuthAccess } from "@/lib/utils/auth";

export const metadata: Metadata = {
  title: "WPT - Manage Category",
};

export default async function EditCategory() {
  const user = await pageAuthAccess(adminManagerStaffRole)

  const categories = await categoriesLoader(user.parentId);

  return (
    <main className="flex flex-col gap-2 max-w-md mx-auto w-full">
      <section className="w-full">
        <div className="flex flex-col gap-3 px-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-row gap-2 bg-gray-700 rounded-md justify-between items-center pl-2"
            >
              <Link
                href={`/manage/category/${cat.id}`}
                className="flex flex-col hover:bg-white/35 w-full"
              >
                <div>{cat.name}</div>
                <div className="text-sm/tight italic opacity-50">
                  {cat.items.length === 0
                    ? "No Item"
                    : `${cat.items.length} Items`}
                </div>
              </Link>
              <EditCategoryModal category={{ id: cat.id, name: cat.name }} />
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-col w-full items-end gap-3 px-4">
        <CreateCategoryModal user={user} />
      </div>
    </main>
  );
}
