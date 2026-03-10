import { prisma } from "@/lib/prisma";
import type { Invoice } from "@/app/types/invoice";

function toInvoice(i: {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  paidDate: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): Invoice {
  return {
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CP-${year}-`;
  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
  });
  let next = 1;
  if (last) {
    const num = parseInt(last.invoiceNumber.replace(prefix, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function readInvoices(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Invoice[]> {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(filters.dateFrom);
    if (filters.dateTo) (where.createdAt as Record<string, Date>).lte = new Date(filters.dateTo + "T23:59:59");
  }
  const rows = await prisma.invoice.findMany({ where, orderBy: { createdAt: "desc" } });
  return rows.map(toInvoice);
}

export async function readInvoiceById(id: string): Promise<Invoice | null> {
  const i = await prisma.invoice.findUnique({ where: { id } });
  return i ? toInvoice(i) : null;
}

export async function createInvoice(data: {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: string;
  subtotal: number;
  tax?: number;
  total: number;
  dueDate?: string;
  notes?: string;
  createdBy?: string;
}): Promise<Invoice> {
  const invoiceNumber = await generateInvoiceNumber();
  const i = await prisma.invoice.create({
    data: { ...data, invoiceNumber },
  });
  return toInvoice(i);
}

export async function updateInvoice(
  id: string,
  data: Partial<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: string;
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    dueDate: string;
    paidDate: string;
    notes: string;
  }>
): Promise<Invoice> {
  const i = await prisma.invoice.update({ where: { id }, data });
  return toInvoice(i);
}

export async function deleteInvoice(id: string): Promise<void> {
  await prisma.invoice.delete({ where: { id } });
}

export async function sumInvoicesByStatus() {
  const rows = await prisma.invoice.groupBy({
    by: ["status"],
    _sum: { total: true },
    _count: true,
  });
  return rows.map((r) => ({
    status: r.status,
    total: r._sum.total ?? 0,
    count: r._count,
  }));
}
