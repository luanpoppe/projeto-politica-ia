import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "./RevealOnScroll";

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:py-28">
      <RevealOnScroll>
        <div className="mx-auto max-w-4xl rounded-3xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-12 text-center sm:px-12 sm:py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Pronto para dar o primeiro passo?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted">
            Crie sua conta gratuitamente e faça parte da construção de uma
            plataforma cívica mais inteligente e acessível.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro">
              <Button>Criar conta</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Entrar</Button>
            </Link>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
