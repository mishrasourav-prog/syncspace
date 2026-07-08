import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "../header & hero/Reveal";

interface PricingPlan {
  name: string;
  price: string;
  note: string;
  features: string[];
  featured?: boolean;
}

const PLANS: PricingPlan[] = [
  { name: "Starter", price: "$0", note: "for teams up to 10", features: ["1 workspace", "Canvas & board views", "Basic AI assistant"] },
  { name: "Team", price: "$14", note: "per user / month", features: ["Unlimited workspaces", "Full AI assistant", "Timeline & roadmaps", "Priority support"], featured: true },
  { name: "Enterprise", price: "Custom", note: "for larger orgs", features: ["SSO & SCIM", "Audit logs", "Dedicated support"] },
];

export function Pricing() {
  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto text-center">
        <Reveal>
          <span className="text-xs font-medium text-primary tracking-wide uppercase">Pricing</span>
          <h2 className="mt-3 text-h1 text-foreground">Simple pricing that scales with you.</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mt-14 text-left">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div
                className={`h-full rounded-2xl border p-7 relative ${
                  p.featured ? "border-primary/50 bg-primary/[0.06]" : "border-border bg-surface/50"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-7 text-[10px] font-medium text-primary-foreground bg-primary px-2.5 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <h3 className="text-foreground font-medium mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-semibold text-foreground">{p.price}</span>
                </div>
                <p className="text-xs text-muted mb-6">{p.note}</p>
                <div className="flex flex-col gap-2.5 mb-7">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                      <span className="text-sm text-foreground/80">{f}</span>
                    </div>
                  ))}
                </div>
                <Button variant={p.featured ? "primary" : "secondary"} className="w-full">
                  {p.name === "Enterprise" ? "Contact sales" : "Get started"}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={240}>
          <a href="#" className="inline-block mt-8 text-sm text-muted hover:text-foreground transition-colors duration-200">
            View full pricing details →
          </a>
        </Reveal>
      </div>
    </section>
  );
}