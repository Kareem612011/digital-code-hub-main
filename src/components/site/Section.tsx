import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function Section({
  eyebrow,
  title,
  desc,
  linkTo,
  linkLabel = "View all",
  children,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  linkTo?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-widest text-brand-accent">{eyebrow}</div>
          )}
          <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
          {desc && <p className="mt-2 text-sm text-muted-foreground">{desc}</p>}
        </div>
        {linkTo && (
          <Link
            to={linkTo}
            className="group inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:text-foreground"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
