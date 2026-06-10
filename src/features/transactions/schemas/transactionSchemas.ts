import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive({ message: 'O valor deve ser maior que zero' }),
  description: z.string().max(200, { message: 'A descrição deve ter no máximo 200 caracteres' }).optional().or(z.literal('')),
  transaction_type: z.enum(['income', 'expense']),
  asset_id: z.string().uuid({ message: 'Selecione um ativo válido' }),
  category_id: z.string().uuid({ message: 'Categoria inválida' }).nullable().optional(),
  payment_method: z.enum(['pix', 'credit', 'debit', 'cash']).nullable().optional(),
  transaction_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Data inválida' }),
});

export type TransactionSchemaInput = z.infer<typeof transactionSchema>;
