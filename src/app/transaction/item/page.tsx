import Link from "next/link";

import { listOfItemsLoader } from "./_loader/listOfItemsLoader";

export default async function Page() {
  const listOfItems = await listOfItemsLoader();

  return (
    <>
      <div className="flex flex-col gap-1 max-w-md mx-auto">
        {listOfItems.map((item) => (
          <Link
            className="h-10 px-3 bg-gray-700 hover:bg-gray-600 border border-gray-400 flex flex-row justify-start items-center"
            key={item.id}
            href={`./item/detail/${item.id}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";
