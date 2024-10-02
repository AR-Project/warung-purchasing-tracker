import { PurchaseEditor } from "./_component/PurchaseEditor";
import { singlePurchaseLoader } from "./_loader/singlePurchase.loader";
import { BackButton } from "./_presentation/BackButton";

export default async function Page({
  params,
}: {
  params: { purchaseId: string };
}) {
  const details = await singlePurchaseLoader(params.purchaseId);

  return (
    <>
      <div className="flex flex-row gap-3 items-center mb-4">
        <BackButton />
        <div>Purchase Details of {params.purchaseId}</div>
      </div>
      <PurchaseEditor purchase={details} />
      <pre className="text-xs">{JSON.stringify(details, null, 2)}</pre>
    </>
  );
}
