
"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TroubleshootingForm } from "@/components/troubleshoot/troubleshooting-form";
import { TroubleshootingResult } from "@/components/troubleshoot/troubleshooting-result";
import { troubleshootSensorData, type TroubleshootSensorDataInput, type TroubleshootSensorDataOutput } from "@/ai/flows/troubleshoot-sensor-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lock, CreditCard } from "lucide-react";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TroubleshootPage() {
  const [result, setResult] = useState<TroubleshootSensorDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();

  const handleFormSubmit = async (data: TroubleshootSensorDataInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      // data already includes selectedModel from the form
      const aiResponse = await troubleshootSensorData(data);
      setResult(aiResponse);
    } catch (e) {
      console.error("Error calling AI flow:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred. The selected AI model might not be configured.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPremiumUser = currentUser?.isLoggedIn && currentUser.subscription.planName === "Premium";
  // Allow access even if not premium, but certain features (like model choice or the flow itself) might be restricted.
  // For this iteration, the premium check remains for the whole page.

  if (!isPremiumUser) {
    return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="AI Powered Troubleshooting"
          description="This feature is exclusively for Premium users."
        />
        <Card className="shadow-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <Lock className="mr-2 h-6 w-6" />
              Access Denied
            </CardTitle>
            <CardDescription>
              The AI Troubleshooting feature requires a Premium subscription. Upgrade your plan to access advanced diagnostic tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {currentUser?.isLoggedIn 
                ? `Your current plan is "${currentUser.subscription.planName}".`
                : "You are currently not logged in."}
            </p>
            <Button asChild>
              <Link href="/subscriptions">
                <CreditCard className="mr-2 h-5 w-5" />
                View Subscription Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="AI Powered Troubleshooting"
        description="Describe your sensor readings and get intelligent advice. Choose your preferred AI model."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-accent" />
            Sensor Data Input
          </CardTitle>
          <CardDescription>
            Provide the current readings, select an AI model, and add any context. Our AI will analyze the data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TroubleshootingForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
      
      { (isLoading && !result && !error) && 
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-2">
          <Bot className="h-12 w-12 text-primary animate-bounce" />
          <p className="text-muted-foreground text-lg">AI is thinking...</p>
          <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      }

      <TroubleshootingResult result={result} error={error} />
    </div>
  );
}
