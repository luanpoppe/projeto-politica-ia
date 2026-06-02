import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { isValidCpf } from '../../../../../shared/utils/cpf.util';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.email('E-mail inválido'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  birthDate: z
    .string()
    .regex(isoDateRegex, 'Data de nascimento deve estar no formato YYYY-MM-DD')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return !Number.isNaN(date.getTime()) && date < today;
    }, 'Data de nascimento inválida'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export class RegisterDto extends createZodDto(registerSchema) {}
