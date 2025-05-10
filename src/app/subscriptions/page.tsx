import { PageHeader } from "@/components/shared/page-header";
import { PlanCard, type SubscriptionPlan } from "@/components/subscriptions/plan-card";

const plans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$9.99",
    priceFrequency: "/month",
    description: "Essential monitoring for personal use.",
    features: [
      "1 Monitored Device",
      "Real-time Data Updates",
      "Basic Alerts",
      "Email Support",
      "Limited AI Troubleshooting (5 queries/month)",
    ],
    ctaLabel: "Choose Basic",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29.99",
    priceFrequency: "/month",
    description: "Advanced features for serious users and small businesses.",
    features: [
      "Up to 5 Monitored Devices",
      "Real-time Data Updates & History",
      "Advanced Customizable Alerts (SMS, Email)",
      "Priority Email & Chat Support",
      "Unlimited AI Troubleshooting",
      "Access to Detailed Reports",
    ],
    isPopular: true,
    ctaLabel: "Choose Premium",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceFrequency: "",
    description: "Tailored solutions for large-scale deployments.",
    features: [
      "Unlimited Devices",
      "Custom Integrations",
      "Dedicated Account Manager",
      "SLA Guarantees",
      "On-premise Options Available",
      "Advanced Security Features",
    ],
    ctaLabel: "Contact Sales",
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Choose Your Plan"
        description="Select the perfect subscription to keep your IoT devices secure and monitored."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground pt-4">
        All plans can be upgraded or downgraded at any time. For questions, please <a href="/contact" className="underline hover:text-accent">contact us</a>.
      </p>
    </div>
  );
}
