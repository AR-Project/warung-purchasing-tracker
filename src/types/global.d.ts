export {};

declare global {
  type FormState<T = void> = {
    message?: string;
    data?: T;
    error?: string;
  };

  type CreateItemPayload = {
    name: string;
  };

  type Item = {
    id: string;
    name: string;
  };

  type Vendor = {
    id: string;
    name: string;
  };

  type CreateVendorsPayload = {
    name: string;
  };
  type CreatePurchasePayload = {
    vendorId: string;
    items: string[];
    date: Date;
  };

  type PurchasedItemPayload = {
    itemId: string;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
  };

  type PurchasedItem = PurchasedItemPayload & {
    name: string;
  };

  type CreatePurchasedItemsPayload = PurchasedItemPayload[];
}
