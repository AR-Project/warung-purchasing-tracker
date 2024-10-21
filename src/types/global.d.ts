export {};

declare global {
  type FormState<T = void> = {
    message?: string;
    data?: T;
    error?: string;
  };

  /**@deprecated */
  type FormStateWithTimestamp<T = void> = {
    message?: string;
    data?: T;
    error?: string;
    timestamp?: string | number;
  };

  type RangeFilter = { from: string; to: string };

  type SearchFilter = {
    range?: RangeFilter;
    keyword?: string;
  };

  type SearchParams = { [key: string]: string | string[] | undefined };

  /** ENTITIES */

  type Item = {
    id: string;
    name: string;
  };

  type Vendor = {
    id: string;
    name: string;
  };

  /** Creator Features */

  type CreateItemPayload = {
    name: string;
  };

  // createItemDbPayload

  type CreateVendorsPayload = {
    name: string;
  };
  type CreatePurchasePayload = {
    vendorId: string;
    items: string[];
    date: Date;
  };

  type CreatePurchaseItemPayload = {
    itemId: string;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
  };

  type CreatePurchaseItemDbPayload = CreatePurchaseItemPayload & {
    purchaseId: string;
    id: string;
  };

  type CreatePurchaseItemWithName = CreatePurchaseItemPayload & {
    name: string;
  };

  /** Displayer Features */

  // PurchaseItemDisplay
  type PurchaseItemDisplay = {
    id: string;
    itemId: string;
    name: string;
    quantityInHundreds: number;
    pricePerUnit: number;
  };

  // PurchaseDisplay
  type PurchaseDisplay = {
    id: string;
    vendorId: string;
    vendorName: string;
    purchasedItemId: string[];
    purchasesAt: Date;
    totalPrice: number;
    items: PurchaseItemDisplay[];
    createdAt: Date;
    imageId: string | null;
  };

  type PurchaseToEdit = {
    id: string;
    vendorId: string;
    vendorName: string;
    purchasedItemId: string[];
    purchasesAt: Date;
    totalPrice: number;
    items: PurchaseItemToEdit[];
    createdAt: Date;
    imageId: string | null;
  };

  type PurchaseItemToEdit = PurchaseItemDisplay & {
    itemId: string;
  };

  /** @deprecated */
  type DisplayPerSingleItem = {
    name: string;
    purchaseAt: Date;
    quantityInHundreds: number;
    pricePerUnit: number;
    totalPrice: number;
    vendor: string;
  };

  /** @deprecated */
  type DisplayGroupedItem = {
    name: string;
    id: string;
    totalQuantityInHundred: number;
    totalPrice: number;
  };
}
