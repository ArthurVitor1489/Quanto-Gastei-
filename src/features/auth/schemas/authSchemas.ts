import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'O e-mail é obrigatório' })
    .email({ message: 'Insira um e-mail válido' }),
  password: z
    .string()
    .min(6, { message: 'A senha deve conter pelo menos 6 caracteres' }),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'O nome completo deve conter pelo menos 2 caracteres' }),
    email: z
      .string()
      .min(1, { message: 'O e-mail é obrigatório' })
      .email({ message: 'Insira um e-mail válido' }),
    password: z
      .string()
      .min(6, { message: 'A senha deve conter pelo menos 6 caracteres' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Confirme sua senha' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type SignUpSchemaInput = z.infer<typeof signUpSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'O e-mail é obrigatório' })
    .email({ message: 'Insira um e-mail válido' }),
});

export type ResetPasswordSchemaInput = z.infer<typeof resetPasswordSchema>;
