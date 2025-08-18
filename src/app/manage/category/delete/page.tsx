import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { adminManagerStaffRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";

import categoriesLoader from "../_loader/category.loader";
import DeleteCategoryModal from "./DeleteCategoryModal";

export default async function EditCategory() {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return <LoginRequiredWarning />;

  const categories = await categoriesLoader(user.parentId);

  return (
    <main className="flex flex-col gap-2 max-w-md mx-auto">
      <div className="italic text-gray-500 text-sm w-full text-center border border-gray-500/50 my-4 py-4 text-balance">
        Press delete icon for deleting an category
      </div>

      <section className="">
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-row gap-2 bg-gray-700 rounded-md justify-between items-center pl-2"
            >
              <div>{cat.name}</div>
              <DeleteCategoryModal category={cat} user={user} />
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-row w-full justify-end"></div>
    </main>
  );
}
