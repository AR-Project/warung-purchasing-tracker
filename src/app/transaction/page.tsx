import Link from "next/link";
import { transactionLoader } from "./purchase/transaction.loaders.action";
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

  return <h1>Pick One...</h1>;
}
