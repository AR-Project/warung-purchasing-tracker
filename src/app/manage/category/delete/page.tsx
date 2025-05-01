import React from "react";

import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import categoriesLoader from "../_loader/category.loader";
import { BackButton } from "@/app/_component/BackButton";
import DeleteCategoryModal from "./DeleteCategoryModal";

export default async function EditCategory() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const categories = await categoriesLoader(session.user.parentId);

  return (
    <main className="flex flex-col gap-2 max-w-md mx-auto">
      <header className="font-bold flex flex-row justify-between items-center">
        <div>Delete Category</div>
        <BackButton />
      </header>

      <section className="">
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-row gap-2 bg-gray-700 rounded-md justify-between items-center pl-2"
            >
              <div>{cat.name}</div>
              <DeleteCategoryModal category={cat} user={session.user} />
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-row w-full justify-end"></div>
    </main>
  );
}
