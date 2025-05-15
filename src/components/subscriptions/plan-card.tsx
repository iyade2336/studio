
"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation"; // For redirecting after "choosing" a plan

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceFrequency: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaLabel: string;
  maxDevices: number;
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlanId: string | null; // ID of the user's current plan, or null if guest
}

export function PlanCard({ plan, currentPlanId }: PlanCardProps) {
  const { toast } = useToast();
  const { currentUser, loginUser, refreshCurrentUser } = useUser(); // Assuming loginUser or a similar function updates the context
  const router = useRouter();

  const isCurrentPlan = plan.id === currentPlanId;
  const isDowngrade = currentUser?.subscription?.maxDevices !== undefined && plan.maxDevices < currentUser.subscription.maxDevices && !isCurrentPlan;


  const handleChoosePlan = () => {
    // Simulate choosing a plan
    // In a real app, this would redirect to a payment gateway or confirmation page
    if (isCurrentPlan) {
        toast({
            title: "Plan Active",
            description: `You are already on the ${plan.name} plan.`,
        });
        return;
    }
     if (isDowngrade) {
        toast({
            title: "Downgrade Selected",
            description: `You selected to downgrade to ${plan.name}. Changes will apply at the end of your current billing cycle.`,
            variant: "default",
        });
        // Here you might want to queue a downgrade request
        return;
    }


    // Simulate updating the user's subscription in the context
    if (currentUser && currentUser.isLoggedIn) {
        const newExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days
        const updatedSubscription = {
            ...currentUser.subscription,
            planName: plan.name,
            maxDevices: plan.maxDevices,
            expiryDate: newExpiryDate,
            // Update other plan-specific booleans based on PLAN_DETAILS from UserContext
            canControlDevice: plan.name === "Premium" || plan.name === "Enterprise",
            canExportCsv: true, // Assuming all paid plans can export
            hasAutoShutdownFeature: plan.name === "Premium" || plan.name === "Enterprise",
            canAccessAiTroubleshooter: plan.name === "Premium" || plan.name === "Enterprise" || plan.name === "Free Trial",
        };
        
        refreshCurrentUser({ subscription: updatedSubscription });

        toast({
          title: `Plan Selected: ${plan.name}`,
          description: plan.id === 'enterprise' 
            ? 'Thank you for your interest! Our sales team will contact you shortly.' 
            : `You've upgraded to the ${plan.name} plan! Your new features are now active.`,
        });
        router.push('/'); // Redirect to dashboard or a confirmation page

    } else {
      // Guest choosing a plan - redirect to register/login
      toast({
        title: `Get Started with ${plan.name}`,
        description: `Please register or login to activate the ${plan.name} plan.`,
      });
      router.push(`/auth/register?plan=${plan.id}`);
    }
  };

  return (
    <Card className={cn(
      "flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300",
      plan.isPopular && !isCurrentPlan ? "border-accent ring-2 ring-accent" : "",
      isCurrentPlan ? "border-primary ring-2 ring-primary bg-primary/5" : ""
    )}>
      {plan.isPopular && !isCurrentPlan && (
        <div className="bg-accent text-accent-foreground text-xs font-semibold py-1 px-3 text-center rounded-t-md">
          Most Popular
        </div>
      )}
      {isCurrentPlan && (
         <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 text-center rounded-t-md">
          Your Current Plan
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
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn("w-full", 
            isCurrentPlan ? "bg-green-600 hover:bg-green-700" : 
            plan.isPopular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )} 
          size="lg"
          onClick={handleChoosePlan}
          disabled={isCurrentPlan || (plan.id === 'enterprise' && currentUser?.isLoggedIn)} // Disable enterprise direct choice if logged in
        >
          {isCurrentPlan ? (<><CheckCircle2 className="mr-2 h-5 w-5"/> Currently Active</>) : 
           isDowngrade ? "Select Downgrade" :
           plan.ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
