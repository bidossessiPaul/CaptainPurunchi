export interface TableReservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  numberOfPersons: string;
  date: string;
  time: string;
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
