import type { TableReservation } from "@/app/types/table-reservation";
import type { RoomReservation } from "@/app/types/room-reservation";
import type { EventReservation } from "@/app/types/event-reservation";

export interface UnifiedCalendarEvent {
  id: string;
  type: "table" | "room" | "event";
  title: string;              // Nom client ou titre événement
  start: Date;                // Date/heure début (normalisée)
  end: Date;                  // Date/heure fin (calculée si besoin)
  status: "pending" | "confirmed" | "completed" | "cancelled";
  color: string;              // Couleur selon type
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  details: string;            // Résumé type-specific
  rawData: TableReservation | RoomReservation | (EventReservation & { eventDay?: string; eventMonth?: string; eventTime?: string });
}
