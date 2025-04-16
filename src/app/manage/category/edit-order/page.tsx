import { auth } from "@/auth";
import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import Link from "next/link";
import categoriesLoader from "../_loader/category.loader";
import CategoryOrderEditor from "../_component/CategoryOrderEditor";
import { BackButton } from "@/app/_component/BackButton";

export default async function Page() {
  const session = await auth();
  if (!session) return <LoginRequiredWarning />;

  const categories = await categoriesLoader(session.user.parentId);

  return (
    <section className="max-w-md mx-auto">
      <header className="h-12 flex flex-row items-center gap-2">
        <BackButton />
        Change Category Order
      </header>
      <CategoryOrderEditor categories={categories} user={session.user} />
    </section>
  );
}
