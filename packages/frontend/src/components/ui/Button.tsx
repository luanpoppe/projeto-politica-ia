import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-soft hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-60",
  secondary:
    "border border-border bg-surface text-foreground shadow-soft hover:border-indigo-100 hover:bg-indigo-50/50",
  ghost: "text-foreground hover:bg-surface-hover",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
