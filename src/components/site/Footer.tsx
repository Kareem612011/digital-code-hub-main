import { Link } from "@tanstack/react-router";
import { Shield, Zap, Headphones, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-brand" />
              <span className="text-lg font-black">Sub<span className="text-gradient">Store</span></span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The premium marketplace for digital subscriptions and memberships. Instant delivery, verified codes, backed by 24/7 support.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { i: Zap, l: "Instant Delivery" },
                { i: Shield, l: "Buyer Protection" },
                { i: Headphones, l: "24/7 Support" },
                { i: Lock, l: "Secure Checkout" },
              ].map(({ i: Icon, l }) => (
                <div key={l} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs">
                  <Icon className="h-4 w-4 text-brand-accent" />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Shop</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/shop" className="hover:text-foreground">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-foreground">Categories</Link></li>
              <li><Link to="/shop" className="hover:text-foreground">Flash Deals</Link></li>
              <li><Link to="/shop" className="hover:text-foreground">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground">Support</Link></li>
              <li><Link to="/account" className="hover:text-foreground">My Account</Link></li>
              <li><a href="#" className="hover:text-foreground">Terms & Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} SubStore. Sample marketplace — for demonstration purposes.</span>
          <div className="flex items-center gap-3">
            <span>USD $</span>
            <span>·</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
