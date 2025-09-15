import { Suspense } from "react";
import { Metadata } from "next";

import { parseSearchParams } from "@/lib/utils/validator";
import { searchVendors } from "@/lib/api";
import { adminManagerStaffRole } from "@/lib/const";
import { verifyUserAccess } from "@/lib/utils/auth";

import LoginRequiredWarning from "@/app/_component/auth/LoginRequiredWarning";
import { SinglePurchaseCard } from "../_component/SinglePurchaseCard";
import SearchBox from "../_component/SearchBox";
import DatePicker from "../_component/DatePicker";
import { transactionLoader } from "./listOfPurchase.loader";
import TransactionNavigation from "../_component/TransactionNav";

type Props = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "WPT - Purchase List",
};

export default async function Page({ searchParams }: Props) {
  const [user, authError] = await verifyUserAccess(adminManagerStaffRole);
  if (authError) return <LoginRequiredWarning />;

  const filterParam = await searchParams;
  const filter = parseSearchParams(filterParam);

  const tx = await transactionLoader(filter, user.parentId);

  return (
    <section className="max-w-md w-full mx-auto flex flex-col gap-3 p-2">
      <TransactionNavigation />
      <div className="py-2 flex flex-row justify-between border-b border-white/20 bg-gradient-to-t from-blue-900/50 to-black mb-2">
        <div className="text-xl">Aktifitas Transaksi</div>
      </div>{" "}
      <Suspense>
        <SearchBox
          activeName={filter.keyword}
          searchHandler={searchVendors}
          placeholder="Cari Vendor..."
        />
      </Suspense>
      <Suspense>
        <DatePicker activeDateRange={filter.range} />
      </Suspense>
      <div className="grid grid-cols-2 gap-3">
        {tx.map((singlePurchase) => (
          <SinglePurchaseCard
            singlePurchase={singlePurchase}
            key={singlePurchase.id}
          />
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
