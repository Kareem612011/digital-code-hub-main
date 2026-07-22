import { useEffect, useState } from "react";

export function Countdown({ target }: { target: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 min-w-[44px]">
      <span className="text-sm font-bold tabular-nums text-foreground">
        {String(n).padStart(2, "0")}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{l}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      {cell(h, "Hr")}
      {cell(m, "Min")}
      {cell(s, "Sec")}
    </div>
  );
}
