import { FeatureCard } from "./FeatureCard";
import { featureIcons } from "./FeatureIcons";
import { RevealOnScroll } from "./RevealOnScroll";

const features = [
  {
    icon: featureIcons.landmark,
    title: "Representantes e mandatos",
    description:
      "Acompanhe quem te representa, propostas e posicionamentos com linguagem acessível.",
  },
  {
    icon: featureIcons.mapPin,
    title: "Sua localidade",
    description:
      "Conecte seu perfil cívico à sua região para receber contexto relevante onde você vive.",
  },
  {
    icon: featureIcons.bell,
    title: "Alertas inteligentes",
    description:
      "Receba avisos sobre votações, projetos de lei e temas que impactam sua comunidade.",
  },
  {
    icon: featureIcons.handshake,
    title: "Participação guiada",
    description:
      "Descubra formas concretas de participar, com explicações claras e sem jargão político.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Funcionalidades pensadas para o cidadão
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Uma plataforma em evolução para tornar a política mais próxima,
              transparente e acionável no dia a dia.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <RevealOnScroll key={feature.title}>
              <FeatureCard {...feature} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
