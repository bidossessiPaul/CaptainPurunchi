import { query } from "@/lib/db";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  targetId: string | null;
  details: string;
  createdAt: string;
}

export async function logActivity(data: {
  userId: string;
  userName: string;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
}): Promise<void> {
  await query('INSERT INTO activity_logs SET ?', [{
    userId: data.userId,
    userName: data.userName,
    action: data.action,
    target: data.target,
    targetId: data.targetId ?? null,
    details: data.details ?? "",
  }]);
}

export async function readActivityLogs(filters?: {
  userId?: string;
  action?: string;
  target?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: ActivityLogEntry[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.userId) {
    conditions.push('userId = ?');
    params.push(filters.userId);
  }
  if (filters?.action) {
    conditions.push('action = ?');
    params.push(filters.action);
  }
  if (filters?.target) {
    conditions.push('target = ?');
    params.push(filters.target);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const [rows, countResult] = await Promise.all([
    query(`SELECT * FROM activity_logs ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query(`SELECT COUNT(*) as total FROM activity_logs ${whereClause}`, params),
  ]);

  return {
    logs: rows.map((r: { id: string; userId: string; userName: string; action: string; target: string; targetId: string | null; details: string; createdAt: Date }) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    total: (countResult[0] as { total: number }).total,
  };
}
