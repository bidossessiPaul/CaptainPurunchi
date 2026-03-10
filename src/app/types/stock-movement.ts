export interface StockMovement {
  id: string;
  stockItemId: string;
  stockItemName: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  reason: string;
  date: string;
  createdBy: string;
  createdAt: string;
}
