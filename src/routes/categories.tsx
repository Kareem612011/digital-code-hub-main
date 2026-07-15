import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Section } from "@/components/site/Section";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { apiFetch } from "@/lib/api";
import type { CategoryRow } from "@/lib/types";

function loadCategories(): Promise<CategoryRow[]> {
  return apiFetch<CategoryRow[]>("/api/categories");
}

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — SubStore" },
      { name: "description", content: "Explore all subscription categories: streaming, gaming, music, productivity and more." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [] } = useQuery<CategoryRow[]>({
    queryKey: ["categories"],
    queryFn: loadCategories,
  });

  return (
    <Section eyebrow="Browse" title="All categories" desc="Find exactly what you're looking for.">
      <CategoryGrid categories={categories} />
    </Section>
  );
}
