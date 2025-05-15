
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TroubleshootingForm } from "@/components/troubleshoot/troubleshooting-form";
import { TroubleshootingResult } from "@/components/troubleshoot/troubleshooting-result";
import { troubleshootSensorData, type TroubleshootSensorDataInput, type TroubleshootSensorDataOutput } from "@/ai/flows/troubleshoot-sensor-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lock } from "lucide-react";
import { useUser } from "@/context/user-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TroubleshootPage() {
  const [result, setResult] = useState<TroubleshootSensorDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();

  // Redirect or show message if user doesn't have access
  useEffect(() => {
    if (currentUser && !currentUser.isLoggedIn) {
      // Optional: Redirect to login if not logged in
      // router.push('/auth/login'); 
    }
  }, [currentUser]);

  const handleFormSubmit = async (data: TroubleshootSensorDataInput) => {
    if (!currentUser?.subscription.canAccessAiTroubleshooter) {
        setError("AI Troubleshooting is not available on your current subscription plan.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const aiResponse = await troubleshootSensorData(data);
      setResult(aiResponse);
    } catch (e) {
      console.error("Error calling AI flow:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="AI Powered Troubleshooting"
          description="Log in to access intelligent advice for your sensor issues."
        />
        <Card className="shadow-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center">
                    <Lock className="mr-2 h-6 w-6 text-primary" />
                    Access Restricted
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Please log in to use the AI Troubleshooting feature.</p>
                <Button asChild>
                    <Link href="/auth/login">Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!currentUser.subscription.canAccessAiTroubleshooter) {
     return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="AI Powered Troubleshooting"
          description="Upgrade your plan to access intelligent advice for your sensor issues."
        />
        <Card className="shadow-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center">
                    <Lock className="mr-2 h-6 w-6 text-destructive" />
                    Feature Unavailable
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">AI Troubleshooting is only available on Premium and Enterprise plans.</p>
                <Button asChild>
                    <Link href="/subscriptions">View Subscription Plans</Link>
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
        description="Describe your sensor readings and get intelligent advice."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6 text-accent" />
            Sensor Data Input
          </CardTitle>
          <CardDescription>
            Provide the current readings from your sensor and any additional context. Our AI will analyze the data and suggest potential issues and solutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TroubleshootingForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
      
      { (isLoading && !result && !error) && 
        <div className="text-center py-4">
          <p className="text-muted-foreground">AI is thinking...</p>
        </div>
      }

      <TroubleshootingResult result={result} error={error} />
    </div>
  );
}
