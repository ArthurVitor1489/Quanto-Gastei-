export interface CreditCard {
  id: string;
  name: string;
  closing_day: number;
  due_day: number;
  limit_amount: number | null;
  created_at: string;
}

export interface CreditCardFormData {
  name: string;
  closing_day: number;
  due_day: number;
  limit_amount?: string | number | null;
}
