import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10 mesh-bg" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-pattern opacity-60" />
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-600">
          Participação cívica com inteligência artificial
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
          Entenda, acompanhe e participe da política do seu jeito
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          O Projeto Política IA conecta cidadãos a informações claras sobre
          representantes, localidades e alertas relevantes — com uma experiência
          simples, moderna e pensada para o Brasil.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/cadastro">
            <Button className="min-w-44">Começar agora</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="min-w-44">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
