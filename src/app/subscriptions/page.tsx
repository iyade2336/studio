
"use client"; 

import { PageHeader } from "@/components/shared/page-header";
import { PlanCard, type SubscriptionPlan } from "@/components/subscriptions/plan-card";
import { useUser } from "@/context/user-context";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Star, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const masterPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$9.99",
    priceValue: 9.99,
    priceFrequency: "/month",
    description: "Essential monitoring for personal use.",
    features: [
      "1 Monitored Device",
      "Real-time Data Updates",
      "Basic Alerts",
      "Email Support",
      "Limited AI Troubleshooting (5 queries/month)",
    ],
    ctaLabel: "Add to Cart",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29.99",
    priceValue: 29.99,
    priceFrequency: "/month",
    description: "Advanced features for serious users and small businesses.",
    features: [
      "Up to 3 Monitored Devices",
      "Real-time Data Updates & History",
      "Advanced Customizable Alerts (SMS, Email)",
      "Priority Email & Chat Support",
      "Unlimited AI Troubleshooting",
      "Access to Detailed Reports",
    ],
    isPopular: true,
    ctaLabel: "Add to Cart",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceValue: 0, // Price not applicable for "Contact Sales"
    priceFrequency: "",
    description: "Tailored solutions for large-scale deployments.",
    features: [
      "5+ Monitored Devices (Unlimited)",
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
  const { currentUser, getSubscriptionDaysRemaining } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [displayPlans, setDisplayPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      setIsLoading(false); 
      const planName = currentUser.isLoggedIn ? currentUser.subscription.planName.toLowerCase() : "none";
      const expiry = currentUser.isLoggedIn ? getSubscriptionDaysRemaining() : "N/A";
      setTimeRemaining(expiry);

      const activePlan = masterPlans.find(p => p.name.toLowerCase() === planName);

      if (currentUser.isLoggedIn && activePlan && expiry !== "Expired" && planName !== "none") {
        setCurrentPlan(activePlan);
        let upgradeOptions: SubscriptionPlan[] = [];
        if (activePlan.id === "basic") {
          const premium = masterPlans.find(p => p.id === "premium");
          if (premium) upgradeOptions.push(premium);
           const enterprise = masterPlans.find(p => p.id === "enterprise");
          if (enterprise) upgradeOptions.push(enterprise);
        } else if (activePlan.id === "premium") {
          const enterprise = masterPlans.find(p => p.id === "enterprise");
          if (enterprise) upgradeOptions.push(enterprise);
        }
        // If enterprise is current, no upgrades to show from masterPlans
        setDisplayPlans(upgradeOptions.length > 0 ? upgradeOptions : []);
      } else {
        setCurrentPlan(null);
        // Show all plans if no active plan, or if it's expired, or if user is not logged in.
        setDisplayPlans(masterPlans); 
      }
    } else {
      // If currentUser is null (still loading initially perhaps)
      setIsLoading(true);
      setDisplayPlans(masterPlans); // Default to show all if user context not ready
    }
  }, [currentUser, getSubscriptionDaysRemaining]);

  if (isLoading && !currentUser) { // Adjusted loading condition
    return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader title="Your Subscription" description="Loading subscription details..." />
        <p className="text-center py-8">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={currentPlan ? "Your Subscription" : "Choose Your Plan"}
        description={
          currentPlan
            ? `Manage your current plan or explore upgrade options.`
            : "Select the perfect subscription to keep your IoT devices secure and monitored."
        }
      />

      {currentPlan && currentUser?.isLoggedIn && timeRemaining !== "Expired" && currentUser.subscription.planName.toLowerCase() !== 'none' ? (
        <Card className="shadow-xl border-primary border-2 mb-8 animate-in fade-in-50 duration-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-primary">Current Plan: {currentPlan.name}</CardTitle>
                <CardDescription>This is your active subscription.</CardDescription>
              </div>
              {currentPlan.isPopular ? <Star className="h-8 w-8 text-yellow-400" /> : <Shield className="h-8 w-8 text-primary" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              <strong>Time Remaining:</strong> <span className={cn("font-semibold", timeRemaining === "Expired" ? "text-destructive": "text-green-600")}>{timeRemaining}</span>
            </p>
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          {currentPlan.id === 'enterprise' && (
             <CardFooter>
                <p className="text-sm text-green-600 font-semibold">You are on our highest-tier plan!</p>
            </CardFooter>
          )}
        </Card>
      ) : currentUser?.isLoggedIn && timeRemaining === "Expired" && currentUser.subscription.planName.toLowerCase() !== 'none' && currentUser.subscription.planName !== '' ? (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Expired!</AlertTitle>
            <AlertDescription>
              Your {currentUser.subscription.planName} subscription has expired. Please choose a new plan below to continue.
            </AlertDescription>
          </Alert>
      ) : !currentUser?.isLoggedIn ? (
         <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>View Plans</AlertTitle>
            <AlertDescription>
             Please <Link href="/auth/login" className="underline font-semibold text-primary hover:text-primary/80">log in</Link> to manage your subscription or view personalized offers.
            </AlertDescription>
        </Alert>
      ) : null}
      
      {displayPlans.length > 0 && (
        <div>
          {currentPlan && displayPlans.length > 0 && currentPlan.id !== 'enterprise' && (
            <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
              Available Upgrades
            </h2>
          )}
           {((timeRemaining === "Expired" && currentUser?.subscription.planName.toLowerCase() !== 'none') || (!currentPlan && currentUser?.isLoggedIn)) && (
             <h2 className="text-xl font-semibold mb-6 text-center text-foreground">
              {timeRemaining === "Expired" && currentUser?.subscription.planName !== "None" ? `Renew Your ${currentUser?.subscription.planName} Plan or Choose Another` : "Available Plans"}
            </h2>
           )}
            {(!currentUser?.isLoggedIn && displayPlans.length > 0) && (
              <h2 className="text-xl font-semibold mb-6 text-center text-foreground">
                Available Plans
              </h2>
            )}


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {displayPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {displayPlans.length === 0 && currentPlan && currentPlan.id === 'enterprise' && (
        <p className="text-center text-muted-foreground pt-4">
          You are currently on our top-tier Enterprise plan. Contact support for any account inquiries.
        </p>
      )}
      {displayPlans.length === 0 && currentPlan && currentPlan.id !== 'enterprise' && (
         <p className="text-center text-muted-foreground pt-4">
            No further upgrades available from the standard list. Contact us for custom solutions if needed.
        </p>
      )}


      {((!currentPlan && !currentUser?.isLoggedIn) || (currentUser?.isLoggedIn && !currentPlan && timeRemaining !== "Expired") ) && (
         <p className="text-center text-sm text-muted-foreground pt-4">
            All plans can be upgraded or downgraded at any time. For questions, please <Link href="/contact" className="underline hover:text-accent">contact us</Link>.
          </p>
      )}
    </div>
  );
}
