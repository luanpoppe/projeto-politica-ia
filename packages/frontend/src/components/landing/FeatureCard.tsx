import { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="glass-card group p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-soft-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {icon}
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </article>
  );
}
