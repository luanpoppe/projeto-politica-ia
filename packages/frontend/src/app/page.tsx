import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CtaSection } from "@/components/landing/CtaSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <CtaSection />
      <footer className="px-4 py-12 text-center text-sm text-muted/80 sm:px-6">
        © {new Date().getFullYear()} Projeto Política IA — participação cívica
        com transparência.
      </footer>
    </>
  );
}
