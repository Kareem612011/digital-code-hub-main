import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Mail, Clock, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Support — SubStore" },
      { name: "description", content: "Get help with your orders, codes and account. 24/7 support and live chat." },
    ],
  }),
  component: Contact,
});

const faqs = [
  { q: "How fast is delivery?", a: "Digital codes are delivered by email within 30 seconds of a successful payment." },
  { q: "What if my code doesn't work?", a: "Contact support within 24 hours with your order ID and we'll replace it or refund you." },
  { q: "Do you support region-locked codes?", a: "Yes — every product page shows the region. Follow the guide to activate correctly." },
  { q: "What payment methods do you accept?", a: "Visa, Mastercard, PayPal, Apple Pay and Google Pay." },
];

function Contact() {
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-accent">We're here to help</div>
      <h1 className="mt-1 text-4xl font-black">Support</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {[
          { i: MessageCircle, t: "Live chat", d: "Average reply under 2 minutes.", b: "Start chat" },
          { i: Mail, t: "Email", d: "support@substore.example", b: "Send email" },
          { i: Clock, t: "24/7 hours", d: "We reply every day, all day.", b: "Learn more" },
        ].map(({ i: Icon, t, d, b }) => (
          <div key={t} className="rounded-2xl glass p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-brand">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="mt-4 text-lg font-bold">{t}</div>
            <div className="text-sm text-muted-foreground">{d}</div>
            <button className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10">{b}</button>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-2xl glass p-6"
        >
          <h2 className="text-lg font-bold">Send us a message</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input placeholder="Name" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <input placeholder="Email" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <input placeholder="Order ID (optional)" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand sm:col-span-2" />
            <textarea placeholder="How can we help?" rows={5} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-brand sm:col-span-2" />
          </div>
          <button type="submit" className="mt-4 rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-lg">
            {sent ? "Message sent ✓" : "Send message"}
          </button>
        </form>

        <div className="rounded-2xl glass p-6">
          <h2 className="text-lg font-bold">Frequently asked</h2>
          <div className="mt-4 divide-y divide-white/5">
            {faqs.map((f, i) => (
              <button key={f.q} onClick={() => setOpen(open === i ? null : i)} className="block w-full py-4 text-left">
                <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {f.q}
                  <ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} />
                </div>
                {open === i && <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
