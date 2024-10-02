import { PurchaseEditor } from "./_component/PurchaseEditor";
import { singlePurchaseLoader } from "./_loader/singlePurchase.loader";
import { BackButton } from "./_presentation/BackButton";

type Props = {
  params: { purchaseId: string };
};

export default async function Page({ params }: Props) {
  const details = await singlePurchaseLoader(params.purchaseId);
  if (!details) return <div>Transaction Not Found</div>;

  return (
    <>
      <div className="flex flex-row gap-3 items-center mb-4">
        <BackButton />
        <div>Purchase Details</div>
      </div>
      <PurchaseEditor purchase={details} />
      <pre className="text-xs text-gray-600">
        {JSON.stringify(details, null, 2)}
      </pre>
    </>
  );
}
