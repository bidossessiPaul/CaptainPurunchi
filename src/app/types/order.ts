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
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}
