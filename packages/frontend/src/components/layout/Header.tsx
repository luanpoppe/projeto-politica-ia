"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-soft">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4 text-white"
        aria-hidden
      >
        <path
          d="M10 3L3 7v6l7 4 7-4V7l-7-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 10l7-4M10 10v7M10 10L3 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Header() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <header className="pointer-events-auto mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 shadow-soft backdrop-blur-xl sm:px-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <LogoMark />
          <span className="text-sm font-semibold tracking-tight sm:text-base">
            Projeto Política IA
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {isLoading ? (
            <span className="px-3 text-sm text-muted">...</span>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/conta"
                className={`rounded-full px-3 py-2 text-sm transition-colors hover:bg-indigo-50/60 ${pathname === "/conta" ? "font-medium text-indigo-600" : "text-muted"}`}
              >
                Minha conta
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-indigo-50/60 hover:text-foreground"
              >
                Entrar
              </Link>
              <Link href="/cadastro">
                <Button>Criar conta</Button>
              </Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}
