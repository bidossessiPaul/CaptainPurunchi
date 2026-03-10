export interface CashOperation {
  id: string;
  cashRegisterId: string;
  type: string;
  amount: number;
  paymentMethod: string;
  description: string;
  createdBy: string;
  createdAt: string;
}
