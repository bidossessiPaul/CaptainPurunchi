export interface Expense {
  id: string;
  amount: number;
  category: string;
  supplier: string;
  description: string;
  paymentMethod: string;
  receiptUrl: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  isRecurring: boolean;
  recurringDay?: number;
  approvedBy: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const EXPENSE_CATEGORIES = [
  "Achats fournisseurs",
  "Salaires",
  "Charges fixes",
  "Entretien & réparations",
  "Marketing",
  "Divers",
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
