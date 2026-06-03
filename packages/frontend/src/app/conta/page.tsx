"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function ContaContent() {
  const { logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="px-4 py-10 sm:px-6">
      <Card className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-foreground">Você está logado</h1>
        <p className="mt-2 text-sm text-muted">
          Sua sessão está ativa. Em breve você verá mais informações da sua
          conta aqui.
        </p>
        <Button variant="secondary" className="mt-6" onClick={handleLogout}>
          Sair da conta
        </Button>
      </Card>
    </div>
  );
}

export default function ContaPage() {
  return (
    <AuthGuard>
      <ContaContent />
    </AuthGuard>
  );
}
