import { clsx } from "clsx";

export function BlogCover({
  cover,
  alt = "",
  size = "md",
  className,
}: {
  cover: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  const sizeStyles = {
    sm: "aspect-[16/9]",
    md: "aspect-[16/10]",
    lg: "aspect-[2/1]",
    hero: "aspect-[21/9]",
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-slate-200",
        sizeStyles[size],
        className
      )}
    >
      <img
        src={cover}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </div>
  );
}
