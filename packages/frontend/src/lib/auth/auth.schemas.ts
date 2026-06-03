import { z } from "zod";
import { isValidCpf, normalizeCpf } from "@/utils/cpf.util";

export const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.email("E-mail inválido"),
    cpf: z.string().refine(isValidCpf, "CPF inválido"),
    birthDate: z
      .string()
      .min(1, "Data de nascimento é obrigatória")
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return !Number.isNaN(date.getTime()) && date < today;
      }, "Data de nascimento inválida"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export function toRegisterPayload(data: RegisterFormData) {
  return {
    name: data.name,
    email: data.email,
    cpf: normalizeCpf(data.cpf),
    birthDate: data.birthDate,
    password: data.password,
  };
}
