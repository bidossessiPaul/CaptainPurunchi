export interface TableReservation {
  id: string;
  name: string;
  phone: string;
  numberOfPersons: string;
  date: string;
  time: string;
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
