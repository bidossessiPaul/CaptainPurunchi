export interface EventReservation {
  id: string;
  customerName: string;
  customerPhone: string;
  eventId: string;
  eventTitle: string;
  attendees: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
