import { Metadata } from "next";
import CalendarManager from "./CalendarManager";

export const metadata: Metadata = {
  title: "Planning Calendrier — Captain Purunchi Admin",
  description: "Vue calendrier unifiée des réservations (tables, chambres, événements)",
};

export default function CalendarPage() {
  return <CalendarManager />;
}
