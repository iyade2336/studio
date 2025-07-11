import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure the API key is read from environment variables
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
