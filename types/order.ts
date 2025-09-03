export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "RETRY";

export interface Order {
  id: string;
  userId: string;
  packageId: string;
  status: OrderStatus;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilterParams {
  status?: OrderStatus;
  userId?: string;
  packageId?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
  offset?: string;
  pageSize?: string;
}
