import { redirect } from "next/navigation";

// Move purchase details path
// from "/transaction/details/[purchaseId]..."
// to   "/transaction/purchase/details/[purchaseId]"

export default function page() {
  redirect("/transaction/purchase");
}
