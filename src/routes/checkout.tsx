import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Check, CreditCard, Mail, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — SubStore" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

const steps = ["Customer Info", "Payment", "Review", "Confirmation"];

function Checkout() {
  const { detailed, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [pay, setPay] = useState("card");
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const next = () => {
    if (step === 2) clear();
    setStep((s) => Math.min(3, s + 1));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black">Checkout</h1>

      <div className="mt-8 flex items-center gap-2 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= step ? "gradient-brand text-white" : "bg-white/5 text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`whitespace-nowrap text-sm ${i === step ? "font-semibold" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl glass p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Customer information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" placeholder="Jane" />
                <Field label="Last name" placeholder="Doe" />
                <Field label="Email" placeholder="you@example.com" icon={Mail} className="sm:col-span-2" />
                <Field label="Country" placeholder="United States" />
                <Field label="Phone (optional)" placeholder="+1 555 0000" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Payment method</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { id: "card", l: "Card" },
                  { id: "paypal", l: "PayPal" },
                  { id: "apple", l: "Apple Pay" },
                  { id: "google", l: "Google Pay" },
                ].map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setPay(o.id)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                      pay === o.id
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
              {pay === "card" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Card number" placeholder="4242 4242 4242 4242" icon={CreditCard} className="sm:col-span-2" />
                  <Field label="Expiry" placeholder="MM / YY" />
                  <Field label="CVC" placeholder="123" icon={Lock} />
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-brand-accent" />
                Payments are encrypted and secured with 256-bit SSL. Accepted: Visa · Mastercard · PayPal · Apple Pay · Google Pay.
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Review your order</h2>
              {detailed.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {detailed.map(({ product, qty }) => (
                    <div key={product.id} className="flex items-center justify-between py-3 text-sm">
                      <span>{product.name} × {qty}</span>
                      <span className="font-semibold">${(product.price * qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full gradient-brand shadow-lg">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-2xl font-black">Order confirmed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your digital codes have been emailed. You can also find them in{" "}
                <Link to="/account" className="text-brand-accent hover:underline">your account</Link>.
              </p>
              <Link to="/shop" className="mt-6 inline-block rounded-xl gradient-brand px-5 py-2.5 font-semibold text-white">
                Continue shopping
              </Link>
            </div>
          )}

          {step < 3 && (
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={next}
                className="rounded-xl gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
              >
                {step === 2 ? "Place order" : "Continue"}
              </button>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl glass p-6">
          <h2 className="text-lg font-bold">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="my-2 border-t border-white/10" />
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            {["VISA", "MC", "PayPal", "Apple Pay", "G Pay"].map((b) => (
              <span key={b} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-semibold">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, icon: Icon, className = "" }: any) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="relative mt-1.5">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
        <input
          placeholder={placeholder}
          className={`w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-3 text-sm outline-none focus:border-brand ${Icon ? "pl-9" : "pl-3"}`}
        />
      </div>
    </div>
  );
}
