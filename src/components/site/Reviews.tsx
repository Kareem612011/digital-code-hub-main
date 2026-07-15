import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Review } from "@/lib/types";

function loadReviews(): Promise<Review[]> {
  return apiFetch<Review[]>("/api/reviews");
}

export function Reviews() {
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: loadReviews,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {reviews.map((r) => (
        <div key={r.id} className="flex flex-col gap-3 rounded-2xl glass p-5">
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: r.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">"{r.text}"</p>
          <div className="mt-auto flex items-center gap-2 text-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-xs font-bold text-white">
              {r.name.slice(0, 1)}
            </div>
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.country} · Verified buyer</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
