export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
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
  createdAt: string;
  updatedAt: string;
}
