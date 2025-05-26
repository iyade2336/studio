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
    .describe('A clear, narrative paragraph explaining the identified problem based on the sensor data. This should be written in a conversational tone, as if advising a user directly.'),
  suggestedSolutions: z
    .string()
    .describe('Detailed, step-by-step solutions presented in narrative paragraphs to resolve the identified problem. Write this as if guiding a user through the steps in a support message. Use full sentences.'),
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
  prompt: `You are an expert IoT device troubleshooter. Please analyze the following sensor data and provide a detailed, conversational explanation of the most likely problem and practical, step-by-step solutions.

Structure your response in clear paragraphs, suitable for direct display to a user seeking help.
For the 'problemIdentification' field, provide a narrative explanation.
For the 'suggestedSolutions' field, provide guidance in paragraph form, like a helpful support message.
Avoid using markdown bullet points or numbered lists directly in your output fields. Write as if you are directly advising the user.

Sensor Data:
Temperature: {{{temperature}}}°C
Humidity: {{{humidity}}}%
Water Leakage: {{#if waterLeakage}}Detected{{else}}Not Detected{{/if}}

{{#if additionalContext}}
Additional Context: {{{additionalContext}}}
{{/if}}

Based on this data, explain the problem and the solutions clearly and conversationally.
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
