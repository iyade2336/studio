import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <Button className={cn("w-full", plan.isPopular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")} size="lg">
          {plan.ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
