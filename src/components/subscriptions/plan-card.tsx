
"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceFrequency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaLabel: string;
}

interface PlanCardProps {
  plan: SubscriptionPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const { toast } = useToast();

  const handleChoosePlan = () => {
    toast({
      title: `Plan Selected: ${plan.name}`,
      description: plan.id === 'enterprise' 
        ? 'Thank you for your interest! Please contact our sales team to discuss enterprise solutions.' 
        : `You've selected the ${plan.name} plan. Proceed to checkout to activate your subscription.`,
    });
    // In a real application, this would navigate to a checkout page or trigger a subscription flow.
    console.log("Chose plan:", plan.id, plan.name);
  };

  return (
    <Card className={cn(
      "flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300",
      plan.isPopular ? "border-accent ring-2 ring-accent" : ""
    )}>
      {plan.isPopular && (
        <div className="bg-accent text-accent-foreground text-xs font-semibold py-1 px-3 text-center rounded-t-md">
          Most Popular
        </div>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-primary">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        <div className="text-4xl font-extrabold">
          {plan.price}
          <span className="text-base font-normal text-muted-foreground ml-1">{plan.priceFrequency}</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn("w-full", plan.isPopular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")} 
          size="lg"
          onClick={handleChoosePlan}
        >
          {plan.ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
