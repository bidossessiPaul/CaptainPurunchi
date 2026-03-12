export interface RoomReservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}
