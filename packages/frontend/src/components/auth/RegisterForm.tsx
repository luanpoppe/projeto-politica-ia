"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import {
  registerSchema,
  toRegisterPayload,
  type RegisterFormData,
} from "@/lib/auth/auth.schemas";
import { formatCpf } from "@/utils/cpf.util";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      birthDate: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      await registerUser(toRegisterPayload(data));
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          (error.response?.data as { message?: string | string[] })?.message;

        if (status === 409) {
          toast.error(
            typeof message === "string"
              ? message
              : "E-mail ou CPF já cadastrado",
          );
          return;
        }

        if (status === 400) {
          toast.error(
            typeof message === "string"
              ? message
              : "Verifique os dados informados",
          );
          return;
        }
      }

      toast.error("Não foi possível criar a conta. Tente novamente.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
      <p className="mt-2 text-sm text-muted">
        Cadastre-se para participar do Projeto Política IA.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Nome completo"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="CPF"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          error={errors.cpf?.message}
          {...register("cpf", {
            onChange: (event) => {
              setValue("cpf", formatCpf(event.target.value), {
                shouldValidate: true,
              });
            },
          })}
        />
        <Input
          label="Data de nascimento"
          type="date"
          error={errors.birthDate?.message}
          {...register("birthDate")}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Repetir senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
