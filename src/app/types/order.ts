export interface OrderItem {
  dishId: string;
  dishName: string;
  category: string;
  price: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}
