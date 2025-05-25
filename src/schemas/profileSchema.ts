
import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .nonempty('Nome é obrigatório'),
  lastName: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .nonempty('Sobrenome é obrigatório'),
  email: z
    .string()
    .email('Email inválido')
    .nonempty('Email é obrigatório'),
  phone: z.string().optional().or(z.literal('')),
  crm: z
    .string()
    .min(4, 'CRM deve ter pelo menos 4 caracteres')
    .nonempty('CRM é obrigatório'),
  title: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
