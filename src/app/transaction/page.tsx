import Link from "next/link";
import { transactionLoader } from "./transaction.loaders.action";
import { SinglePurchaseCard } from "./_component/SinglePurchaseCard";

export default async function Page() {
  const tx = await transactionLoader();

  /** #TODO: Implement display based on these
   * - Based on month
   * - FUTURE:Based on calendar
   *    - Highlight dates that purchase happen
   *    - Pop up transaction details from that date
   */

  function prettyStringify(object: any) {
    return JSON.stringify(object, null, "\t");
  }

  return (
    <section className="max-w-[500px] w-full mx-auto flex flex-col gap-3 p-2">
      {tx.map((singlePurchase) => (
        <SinglePurchaseCard
          singlePurchase={singlePurchase}
          key={singlePurchase.id}
        />
      ))}
    </section>
  );
}
