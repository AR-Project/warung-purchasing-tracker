import React from "react";
import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import EditCategoryModal from "./_component/EditCategoryModal";
import CreateCategoryModal from "./_component/CreateCategoryModal";
import categoriesLoader from "./_loader/category.loader";
import Link from "next/link";

export default async function EditCategory() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const categories = await categoriesLoader(session.user.parentId);

  return (
    <main className="flex flex-col gap-2 max-w-md mx-auto">
      <header className="font-bold flex flex-row justify-between items-center">
        <div>Manage Item Category</div>
        <Link
          href="/manage/category/edit-order"
          className="h-8 border border-white/50 px-2 bg-blue-950 rounded-sm text-white focus:outline-none hover:bg-blue-800  flex flex-row gap-2 justify-center items-center"
        >
          Change Order
        </Link>
      </header>

      <section className="">
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-row gap-2 bg-gray-700 rounded-md justify-between items-center pl-2"
            >
              <div>{cat.name}</div>
              <EditCategoryModal
                user={session.user}
                category={{ id: cat.id, name: cat.name }}
              />
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-row w-full justify-end">
        <CreateCategoryModal user={session.user} />
      </div>
    </main>
  );
}
