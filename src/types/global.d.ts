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

  type DisplaySingleItem = {
    id: string;
    name: string;
    quantityInHundreds: number;
    pricePerUnit: number;
  };

  type DisplaySinglePurchase = {
    id: string;
    vendorId: string;
    vendorName: string;
    purchasedItemId: string[];
    purchasesAt: Date;
    totalPrice: number;
    items: DisplaySingleItem[];
    createdAt: Date;
  };
  type DisplayPurchases = DisplaySinglePurchase[];

  type DisplayPerSingleItem = {
    name: string;
    purchaseAt: Date;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
    vendor: string;
  };
  type DisplayItems = DisplayPerSingleItem[];
}
