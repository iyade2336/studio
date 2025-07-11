"use client"
import { useState, useEffect } from "react";
import type { TroubleshootSensorDataInput, TroubleshootSensorDataOutput } from "@/ai/flows/troubleshoot-sensor-data";
import { troubleshootSensorData } from "@/ai/flows/troubleshoot-sensor-data";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bot, CheckCircle2, Loader2 } from "lucide-react";
import type { SensorData } from "./sensor-card";
import { useLanguage } from "@/context/language-context";
import { translations } from "@/lib/translations";

interface AutomaticAiAnalysisProps {
    sensorData: SensorData;
}

const useTypingEffect = (text: string, speed = 50) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText(''); // Reset when text changes
        if (text) {
            let i = 0;
            const intervalId = setInterval(() => {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
                if (i >= text.length) {
                    clearInterval(intervalId);
                }
            }, speed / 2); // Adjust speed for a more natural feel
            return () => clearInterval(intervalId);
        }
    }, [text, speed]);

    return displayedText;
};

export function AutomaticAiAnalysis({ sensorData }: AutomaticAiAnalysisProps) {
    const [result, setResult] = useState<TroubleshootSensorDataOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { currentUser } = useUser();
    const { language } = useLanguage();
    const t = translations[language].aiAnalysis;

    const problemText = useTypingEffect(result?.problemIdentification || '');
    const solutionText = useTypingEffect(result?.suggestedSolutions || '');

    useEffect(() => {
        const analyzeData = async () => {
            if (!currentUser?.subscription.canAccessAiTroubleshooter) {
                setError("AI Troubleshooting is not available on your current subscription plan.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            setResult(null);

            const input: TroubleshootSensorDataInput = {
                temperature: sensorData.temperature || 20, // Provide default values
                humidity: sensorData.humidity || 50,
                waterLeakage: sensorData.waterLeak || false,
                additionalContext: `Automatic analysis for device ${sensorData.id} which is reporting a '${sensorData.status}' status.`
            };

            try {
                const aiResponse = await troubleshootSensorData(input);
                setResult(aiResponse);
            } catch (e) {
                console.error("Error calling AI flow:", e);
                setError(e instanceof Error ? e.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        analyzeData();
    }, [sensorData.id, currentUser?.subscription.canAccessAiTroubleshooter]); // Re-run analysis if the problematic sensor changes

    return (
        <Card className="shadow-lg bg-gradient-to-br from-background to-secondary/30 border-l-4 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                    <Bot className="mr-3 h-6 w-6" />
                    {t.title}
                </CardTitle>
                <CardDescription>
                    {t.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>{t.thinking}</span>
                    </div>
                )}
                {error && (
                    <div className="text-destructive flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        <p>{error}</p>
                    </div>
                )}
                {result && !isLoading && (
                    <>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500"/>
                                {t.problem}
                            </h3>
                            <div className="text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-line min-h-[50px]">
                                {problemText}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center">
                                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                                {t.solutions}
                            </h3>
                            <div className="text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-line min-h-[50px]">
                                {solutionText}
                            </div>
                        </div>
                    </>
                )}
                 <p className="text-xs text-muted-foreground pt-4 border-t">
                    {t.disclaimer}
                </p>
            </CardContent>
        </Card>
    );
}
