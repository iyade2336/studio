import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

// Genkit runs on the server, so it can access server-side environment variables directly.
// These are not exposed to the client.
export const ai = genkit({
  plugins: [googleAI({apiKey: serverRuntimeConfig.GEMINI_API_KEY || process.env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.0-flash',
});
