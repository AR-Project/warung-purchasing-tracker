import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import categoriesLoader from "../_loader/category.loader";
import CategoryOrderEditor from "../_component/CategoryOrderEditor";

export default async function Page() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const categories = await categoriesLoader(session.user.parentId);

  return (
    <section className="max-w-md mx-auto">
      <div className="italic text-gray-500 text-sm w-full text-center border border-gray-500/50 my-4 py-4 text-balance">
        Drag and drop your order, then click save when finished
      </div>
      <CategoryOrderEditor categories={categories} user={session.user} />
    </section>
  );
}
