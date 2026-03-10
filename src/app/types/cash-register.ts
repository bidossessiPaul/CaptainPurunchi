export interface CashRegister {
  id: string;
  date: string;
  openedBy: string;
  closedBy: string;
  openingBalance: number;
  especes: number;
  carte: number;
  mtnMoney: number;
  moovMoney: number;
  virement: number;
  closingBalance: number;
  difference: number;
  notes: string;
  status: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
