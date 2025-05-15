
"use client"; // Make this a client component to use hooks
import { PageHeader } from "@/components/shared/page-header";
import { PlanCard, type SubscriptionPlan } from "@/components/subscriptions/plan-card";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ArrowRightCircle, Star } from "lucide-react";

const allPlans: SubscriptionPlan[] = [
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
      "Limited AI Troubleshooting (Not available)",
      "CSV Data Export",
    ],
    ctaLabel: "Choose Basic",
    maxDevices: 1,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29.99",
    priceFrequency: "/month",
    description: "Advanced features for serious users and small businesses.",
    features: [
      "Up to 3 Monitored Devices",
      "Real-time Data Updates & History (Basic)",
      "Advanced Customizable Alerts (SMS, Email)",
      "Priority Email & Chat Support",
      "Unlimited AI Troubleshooting",
      "Device Control (On/Off)",
      "Auto-Shutdown Alerts",
      "CSV Data Export",
    ],
    isPopular: true,
    ctaLabel: "Choose Premium",
    maxDevices: 3,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceFrequency: "",
    description: "Tailored solutions for large-scale deployments.",
    features: [
      "5+ Monitored Devices (Scalable)",
      "Custom Integrations & API Access",
      "Dedicated Account Manager & SLA",
      "On-premise Options Available",
      "Advanced Security & Audit Logs",
      "All Premium Features Included",
    ],
    ctaLabel: "Contact Sales",
    maxDevices: 10, // Default, admin can increase
  },
];

const planOrder: Record<string, number> = {
    "None": 0,
    "Free Trial": 1,
    "Basic": 2,
    "Premium": 3,
    "Enterprise": 4,
};


export default function SubscriptionsPage() {
  const { currentUser, getSubscriptionDaysRemaining } = useUser();

  const currentPlanName = currentUser?.subscription.planName || "None";
  const currentPlanDetails = allPlans.find(p => p.name === currentPlanName);
  const currentPlanOrder = planOrder[currentPlanName] ?? -1;

  const upgradeablePlans = allPlans.filter(plan => 
    planOrder[plan.name] > currentPlanOrder && plan.name !== "Enterprise" // Don't show Enterprise as direct upgrade here
  );
  const highestUpgradeablePlan = upgradeablePlans.length > 0 ? upgradeablePlans[upgradeablePlans.length-1] : null;


  if (!currentUser || !currentUser.isLoggedIn) {
    // Show all plans for guests or logged-out users
    return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="Choose Your Plan"
          description="Select the perfect subscription to keep your IoT devices secure and monitored."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {allPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} currentPlanId={null} />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground pt-4">
          All plans can be upgraded or downgraded at any time. For questions, please <a href="/contact" className="underline hover:text-accent">contact us</a>.
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <PageHeader
        title="My Subscription"
        description="Manage your current plan and explore upgrade options."
      />
      
      {currentPlanDetails && (
        <Card className="shadow-lg border-primary ring-2 ring-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl md:text-3xl text-primary flex items-center">
                        <Star className="mr-2 h-6 w-6 text-yellow-400 fill-yellow-400" /> Your Current Plan: {currentPlanDetails.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {getSubscriptionDaysRemaining()}
                        {currentPlanDetails.name !== "Enterprise" && ` (Renews/Expires on: ${new Date(currentUser.subscription.expiryDate).toLocaleDateString()})`}
                    </CardDescription>
                </div>
                {currentPlanDetails.name === "Enterprise" && (
                     <Button variant="outline" asChild><Link href="/contact-sales">Contact Support</Link></Button>
                )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{currentPlanDetails.description}</p>
            <h4 className="font-semibold text-lg">Key Features:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {currentPlanDetails.features.slice(0,6).map((feature, index) => ( // Show a subset of features
                <li key={index} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm">Max Devices: <span className="font-semibold">{currentUser.subscription.maxDevices}</span></p>
          </CardContent>
           {currentPlanDetails.name !== "Enterprise" && highestUpgradeablePlan && (
            <CardFooter className="border-t pt-4">
                 <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                    <p className="text-sm text-muted-foreground">Looking for more features or devices?</p>
                    <Button size="lg" asChild>
                        <Link href={`#${highestUpgradeablePlan.id}`}>
                            Upgrade to {highestUpgradeablePlan.name} <ArrowRightCircle className="ml-2 h-5 w-5"/>
                        </Link>
                    </Button>
                 </div>
            </CardFooter>
           )}
        </Card>
      )}

      {currentPlanName !== "Enterprise" && upgradeablePlans.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 mt-10 text-center">Available Upgrades</h2>
          <div className={`grid grid-cols-1 ${upgradeablePlans.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1 md:max-w-md mx-auto"} gap-6 md:gap-8 items-stretch`}>
            {upgradeablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} currentPlanId={currentPlanDetails?.id || null} />
            ))}
          </div>
        </div>
      )}
       {currentPlanName !== "Enterprise" && upgradeablePlans.length === 0 && currentPlanName !== "None" && (
         <p className="text-center text-muted-foreground mt-8">
            You are currently on our highest available self-service plan. For custom needs, please contact sales about our Enterprise solutions.
        </p>
       )}


      <p className="text-center text-sm text-muted-foreground pt-8">
        Need help or want to discuss a custom Enterprise solution? <Button variant="link" asChild className="p-0 h-auto"><Link href="/contact">Contact our support team.</Link></Button>
      </p>
    </div>
  );
}
