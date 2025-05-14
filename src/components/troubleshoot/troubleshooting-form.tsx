
"use client";
import type { TroubleshootSensorDataInput } from "@/ai/flows/troubleshoot-sensor-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  temperature: z.coerce.number().min(-50, "Too low").max(100, "Too high"),
  humidity: z.coerce.number().min(0, "Cannot be less than 0").max(100, "Cannot be more than 100"),
  waterLeakage: z.boolean().default(false),
  selectedModel: z.enum(['gemini', 'chatgpt']).default('gemini'),
  additionalContext: z.string().optional(),
});

interface TroubleshootingFormProps {
  onSubmit: (data: TroubleshootSensorDataInput) => Promise<void>;
  isLoading: boolean;
}

export function TroubleshootingForm({ onSubmit, isLoading }: TroubleshootingFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temperature: 20,
      humidity: 50,
      waterLeakage: false,
      selectedModel: 'gemini',
      additionalContext: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    await onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="humidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Humidity (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 55" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="waterLeakage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Water Leakage Detected</FormLabel>
                <FormDescription>
                  Check this if your sensor indicates a water leak.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="selectedModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Model</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gemini">Gemini (Google AI)</SelectItem>
                  <SelectItem value="chatgpt">Chat GPT (OpenAI)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the AI model for troubleshooting. Note: Chat GPT may require separate API configuration.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="additionalContext"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Context (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe any other symptoms, error messages, or observations..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The more details you provide, the better the AI can assist.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Get Troubleshooting Advice"
          )}
        </Button>
      </form>
    </Form>
  );
}
