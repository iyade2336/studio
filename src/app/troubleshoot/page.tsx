"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TroubleshootingForm } from "@/components/troubleshoot/troubleshooting-form";
import { TroubleshootingResult } from "@/components/troubleshoot/troubleshooting-result";
import { troubleshootSensorData, type TroubleshootSensorDataInput, type TroubleshootSensorDataOutput } from "@/ai/flows/troubleshoot-sensor-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function TroubleshootPage() {
  const [result, setResult] = useState<TroubleshootSensorDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: TroubleshootSensorDataInput) => {
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
          {/* You can add a more sophisticated loader here if desired */}
        </div>
      }

      <TroubleshootingResult result={result} error={error} />
    </div>
  );
}
