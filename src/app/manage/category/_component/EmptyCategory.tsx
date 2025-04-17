import CreateCategoryModal from "./CreateCategoryModal";

type Props = {
  user: UserSession;
};

export default function EmptyCategory({ user }: Props) {
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center items-center h-48 bg-gray-900 rounded-3xl">
      <div className="uppercase pb-10 text-xl">Kategori kosong</div>
      <div className="italic text-gray-500/50">Buat Kategory baru</div>
      <CreateCategoryModal user={user} />
    </div>
  );
}
