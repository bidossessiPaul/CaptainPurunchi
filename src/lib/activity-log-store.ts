import { prisma } from "@/lib/prisma";

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
  await prisma.activityLog.create({
    data: {
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      target: data.target,
      targetId: data.targetId ?? null,
      details: data.details ?? "",
    },
  });
}

export async function readActivityLogs(filters?: {
  userId?: string;
  action?: string;
  target?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: ActivityLogEntry[]; total: number }> {
  const where: Record<string, unknown> = {};
  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = filters.action;
  if (filters?.target) where.target = filters.target;

  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    logs: rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
  };
}
