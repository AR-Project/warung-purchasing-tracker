import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { adminManagerStaffRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";
import categoriesLoader from "../_loader/category.loader";
import CategoryOrderEditor from "../_component/CategoryOrderEditor";
import EmptyCategory from "../_component/EmptyCategory";

export default async function Page() {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return <LoginRequiredWarning />;

  const categories = await categoriesLoader(user.parentId);

  return (
    <section className="max-w-md mx-auto">
      <div className="italic text-gray-500 text-sm w-full text-center border border-gray-500/50 my-4 py-4 text-balance">
        Drag and drop your order, then click save when finished
      </div>
      {categories.length === 0 ? (
        <EmptyCategory user={user} />
      ) : (
        <CategoryOrderEditor categories={categories} user={user} />
      )}
    </section>
  );
}
