import { Mail } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-3xl glass-strong p-10 md:p-14">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl" />
      <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-accent">Stay in the loop</div>
          <h3 className="mt-2 text-3xl font-black md:text-4xl">Get flash deals before anyone else.</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Weekly drops with up to 70% off. No spam, unsubscribe anytime.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setSent(true);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
          >
            {sent ? "Subscribed ✓" : "Subscribe"}
          </button>
        </form>
      </div>
    </div>
  );
}
