/**
 * Quanto Gastei? - Payment Methods
 * Available payment methods with labels and icons.
 */

import { PaymentMethod } from '../types/transaction';

interface PaymentMethodOption {
  label: string;
  value: PaymentMethod;
  icon: string;
}

export const PAYMENT_METHODS: readonly PaymentMethodOption[] = [
  {
    label: 'Pix',
    value: 'pix',
    icon: 'qr-code',
  },
  {
    label: 'Crédito',
    value: 'credit',
    icon: 'credit-card',
  },
  {
    label: 'Débito',
    value: 'debit',
    icon: 'credit-card',
  },
  {
    label: 'Dinheiro',
    value: 'cash',
    icon: 'payments',
  },
] as const;

/**
 * Returns the display label for a payment method.
 */
export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const found = PAYMENT_METHODS.find((pm) => pm.value === method);
  return found?.label ?? method;
};

/**
 * Returns the icon name for a payment method.
 */
export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  const found = PAYMENT_METHODS.find((pm) => pm.value === method);
  return found?.icon ?? 'help-outline';
};
