export interface StockItem {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
