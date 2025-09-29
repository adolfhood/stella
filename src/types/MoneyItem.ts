export interface MoneyItem {
  id: string;
  type: string;
  date: string; // datetime string
  account: string; // uuid
  category: string; // uuid
  amount: number;
  note: string;
  description: string;
  repeatConfig: null | any; // jsonb
  installmentConfig: null | any; // jsonb
}