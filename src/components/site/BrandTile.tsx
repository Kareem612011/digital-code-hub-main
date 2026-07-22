interface BrandTileProps {
  brand: string;
  gradient: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  subtitle?: string;
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function BrandTile({
  brand,
  gradient,
  className = "",
  size = "md",
  subtitle,
}: BrandTileProps) {
  const letter =
    brand
      .replace(/[^A-Za-z0-9+]/g, "")
      .slice(0, 1)
      .toUpperCase() || "•";
  const color = gradient || "#6d5dfc";

  const isHexOrCssColor =
    color.startsWith("#") ||
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.includes("gradient");

  const style = isHexOrCssColor
    ? {
        background:
          color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")
            ? `linear-gradient(135deg, ${color}, #0f172a)`
            : color,
      }
    : undefined;

  const bgClass = isHexOrCssColor ? "" : `bg-gradient-to-br ${color}`;

  return (
    <div style={style} className={`relative overflow-hidden rounded-2xl ${bgClass} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex h-full w-full flex-col justify-between p-4">
        <div className={`font-black tracking-tight text-white/95 ${sizes[size]}`}>{letter}</div>
        <div>
          <div className="text-xs uppercase tracking-widest text-white/70">Brand</div>
          <div className="truncate text-sm font-semibold text-white">{brand}</div>
          {subtitle && <div className="truncate text-[11px] text-white/70">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
