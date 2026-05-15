import { query, cachedQuery } from "@/lib/db";
import type { ContactInfo, ContactMessage } from "@/app/types/contact";

const SINGLETON_ID = "singleton";

export async function readContactInfo(): Promise<ContactInfo> {
  const rows = await cachedQuery('SELECT * FROM contact_info WHERE id = ?', [SINGLETON_ID]);
  let info = rows[0];

  if (!info) {
    await query('INSERT INTO contact_info SET ?', [{ id: SINGLETON_ID, updatedAt: new Date() }]);
    const newRows = await query('SELECT * FROM contact_info WHERE id = ?', [SINGLETON_ID]);
    info = newRows[0];
  }

  return {
    ...info,
    updatedAt: info.updatedAt.toISOString(),
  };
}

export async function updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  const fields: string[] = [];
  const values: unknown[] = [];

  const allowedFields = [
    "phone", "email", "address", "whatsapp", "facebook", "instagram",
    "hours1Label", "hours1Value", "hours2Label", "hours2Value",
    "hours3Label", "hours3Value", "footerDesc",
  ];

  for (const field of allowedFields) {
    if (data[field as keyof ContactInfo] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(String(data[field as keyof ContactInfo]));
    }
  }

  if (fields.length > 0) {
    values.push(SINGLETON_ID);
    await query(`UPDATE contact_info SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return readContactInfo();
}

export async function readContactMessages(): Promise<ContactMessage[]> {
  const messages = await query('SELECT * FROM contact_messages ORDER BY createdAt DESC');
  return messages.map((m: { id: string; name: string; email: string; phone: string; subject: string; message: string; read: number; createdAt: Date }) => ({
    ...m,
    read: m.read === 1,
    createdAt: m.createdAt.toISOString()
  }));
}

export async function readContactMessageById(id: string): Promise<ContactMessage | null> {
  const messages = await query('SELECT * FROM contact_messages WHERE id = ?', [id]);
  if (messages.length === 0) return null;
  const m = messages[0];
  return {
    ...m,
    read: m.read === 1,
    createdAt: m.createdAt.toISOString()
  };
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO contact_messages (id, name, email, phone, subject, message, `read`) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.email, data.phone, data.subject, data.message, 0]
  );
  const created = await readContactMessageById(id);
  if (!created) throw new Error('Failed to create contact message');
  return created;
}

export async function updateContactMessage(id: string, data: Partial<{ read: boolean }>): Promise<ContactMessage | null> {
  if (data.read !== undefined) {
    await query('UPDATE contact_messages SET `read` = ? WHERE id = ?', [data.read ? 1 : 0, id]);
  }
  return readContactMessageById(id);
}

export async function deleteContactMessage(id: string): Promise<void> {
  await query('DELETE FROM contact_messages WHERE id = ?', [id]);
}
