import type { TroubleshootSensorDataOutput } from "@/ai/flows/troubleshoot-sensor-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface TroubleshootingResultProps {
  result: TroubleshootSensorDataOutput | null;
  error?: string | null;
}

export function TroubleshootingResult({ result, error }: TroubleshootingResultProps) {
  if (error) {
    return (
      <Card className="mt-6 border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className="mt-8 shadow-lg bg-gradient-to-br from-background to-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <CheckCircle2 className="mr-3 h-7 w-7 text-green-500" />
          AI Troubleshooting Analysis
        </CardTitle>
        <CardDescription>
          Based on the provided data, here's the AI's assessment and suggestions:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Problem Identification:</h3>
          <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">{result.problemIdentification}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Suggested Solutions:</h3>
          <div className="text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
            {result.suggestedSolutions.split('\n').map((line, index) => (
              <p key={index} className={line.startsWith('- ') ? 'ml-4' : ''}>{line}</p>
            ))}
          </div>
        </div>
         <p className="text-xs text-muted-foreground pt-4 border-t">
            Disclaimer: This AI-generated advice is for informational purposes only and should not replace professional judgment. Always ensure safety when working with electronic devices.
          </p>
      </CardContent>
    </Card>
  );
}
