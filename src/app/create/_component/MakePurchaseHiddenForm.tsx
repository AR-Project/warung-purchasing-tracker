"use client";

type Props = {
  purchasedAt: string;
  vendorId: string | null;
  listOfPurchaseItem: CreatePurchaseItemWithName[];
  totalPurchase: number;
  image: Blob | null;
  clearFrom: () => void;
  formAction: (formData: FormData) => void;
};

function MakePurchaseHiddenForm({
  purchasedAt,
  vendorId,
  listOfPurchaseItem,
  totalPurchase,
  image,
  clearFrom,
  formAction,
}: Props) {
  const listOfPurchaseItemPayload: CreatePurchaseItemPayload[] =
    listOfPurchaseItem.map((item) => ({
      itemId: item.itemId,
      quantityInHundreds: item.quantityInHundreds,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.totalPrice,
    }));

  const isPayloadExist = () => {
    return (
      listOfPurchaseItemPayload.length > 0 &&
      purchasedAt &&
      vendorId &&
      totalPurchase
    );
  };

  function interceptAction(formData: FormData) {
    if (image) formData.append("image", image, "hidden-upload.jpg");
    formAction(formData);
  }

  return (
    <form action={interceptAction}>
      {vendorId && <input type="hidden" name="vendor-id" value={vendorId} />}
      <input type="hidden" name="purchased-at" value={purchasedAt} />
      <input type="hidden" name="total-price" value={totalPurchase} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(listOfPurchaseItemPayload)}
      />

      <button
        className="bg-blue-900 hover:bg-blue-800 border border-gray-600 text-white p-1 rounded-sm w-full ml-auto disabled:bg-blue-800/50 disabled:cursor-not-allowed disabled:text-white/50"
        disabled={!isPayloadExist()}
      >
        Simpan Transaksi
      </button>
    </form>
  );
}

export default MakePurchaseHiddenForm;
