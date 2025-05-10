'use server';

/**
 * @fileOverview A sensor data troubleshooting AI agent.
 *
 * - troubleshootSensorData - A function that handles the sensor data troubleshooting process.
 * - TroubleshootSensorDataInput - The input type for the troubleshootSensorData function.
 * - TroubleshootSensorDataOutput - The return type for the troubleshootSensorData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TroubleshootSensorDataInputSchema = z.object({
  temperature: z.number().describe('The temperature reading from the sensor.'),
  humidity: z.number().describe('The humidity reading from the sensor.'),
  waterLeakage: z.boolean().describe('Whether water leakage is detected or not.'),
  additionalContext: z
    .string()
    .optional()
    .describe('Any additional context or details about the situation.'),
});
export type TroubleshootSensorDataInput = z.infer<typeof TroubleshootSensorDataInputSchema>;

const TroubleshootSensorDataOutputSchema = z.object({
  problemIdentification: z
    .string()
    .describe('The identified problem based on the sensor data.'),
  suggestedSolutions: z
    .string()
    .describe('Suggested solutions to resolve the identified problem.'),
});
export type TroubleshootSensorDataOutput = z.infer<typeof TroubleshootSensorDataOutputSchema>;

export async function troubleshootSensorData(
  input: TroubleshootSensorDataInput
): Promise<TroubleshootSensorDataOutput> {
  return troubleshootSensorDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'troubleshootSensorDataPrompt',
  input: {schema: TroubleshootSensorDataInputSchema},
  output: {schema: TroubleshootSensorDataOutputSchema},
  prompt: `You are an expert IoT device troubleshooter.

You will use the sensor data to identify potential problems and suggest solutions.

Sensor Data:
Temperature: {{{temperature}}}°C
Humidity: {{{humidity}}}%
Water Leakage: {{#if waterLeakage}}Detected{{else}}Not Detected{{/if}}

{{#if additionalContext}}
Additional Context: {{{additionalContext}}}
{{/if}}

Based on this data, identify the most likely problem and suggest solutions. Be specific and practical.
`,
});

const troubleshootSensorDataFlow = ai.defineFlow(
  {
    name: 'troubleshootSensorDataFlow',
    inputSchema: TroubleshootSensorDataInputSchema,
    outputSchema: TroubleshootSensorDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
