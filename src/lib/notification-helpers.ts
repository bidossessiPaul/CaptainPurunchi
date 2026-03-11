import { query } from "@/lib/db";
import { canAccess } from "@/lib/permissions";
import {
  sendNewReservationNotification,
  sendNewOrderNotification,
} from "@/lib/mail";

interface User {
  email: string;
  name: string;
  role: string;
}

/**
 * Notify team members who have access to "reservations" page
 */
export async function notifyTeamNewReservation(
  type: "table" | "room" | "event",
  customerName: string,
  details: string,
  date: string
): Promise<void> {
  const users: User[] = await query(
    'SELECT email, name, role FROM users WHERE active = 1'
  );

  const notifiable = users.filter((u) => canAccess(u.role, "reservations"));

  await Promise.allSettled(
    notifiable.map((u) =>
      sendNewReservationNotification({
        to: u.email,
        memberName: u.name,
        type,
        customerName,
        details,
        date,
      })
    )
  );
}

/**
 * Notify team members who have access to "orders" page
 */
export async function notifyTeamNewOrder(
  customerName: string,
  itemCount: number,
  totalAmount: string
): Promise<void> {
  const users: User[] = await query(
    'SELECT email, name, role FROM users WHERE active = 1'
  );

  const notifiable = users.filter((u) => canAccess(u.role, "orders"));

  await Promise.allSettled(
    notifiable.map((u) =>
      sendNewOrderNotification({
        to: u.email,
        memberName: u.name,
        customerName,
        itemCount,
        totalAmount,
      })
    )
  );
}
