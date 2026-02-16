import { clsx } from "clsx";
import Link from "next/link";

interface ButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}

export function Button({
  href,
  variant = "primary",
  size = "lg",
  children,
  className,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 cursor-pointer";

  const variants = {
    primary:
      "gradient-brand text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02]",
    secondary:
      "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-slate-100",
  };

  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-12 py-5 text-lg",
  };

  return (
    <Link
      href={href}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
