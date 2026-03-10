export interface EventReservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventId: string;
  eventTitle: string;
  attendees: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
