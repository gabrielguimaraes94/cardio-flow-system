
import * as yup from 'yup';

export const profileSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome é obrigatório'),
  lastName: yup
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .required('Sobrenome é obrigatório'),
  email: yup
    .string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  phone: yup.string().optional(),
  crm: yup
    .string()
    .min(4, 'CRM deve ter pelo menos 4 caracteres')
    .required('CRM é obrigatório'),
  title: yup.string().optional(),
  bio: yup.string().optional(),
});
