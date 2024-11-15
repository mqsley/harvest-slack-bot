// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";


// From the Firebase plugin, import the functions needed to deploy flows using
// Cloud Functions.
import {firebaseAuth} from "@genkit-ai/firebase/auth";
import {onFlow} from "@genkit-ai/firebase/functions";

const ai = genkit({
  plugins: [
    /* Add your plugins here. */
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
export const menuSuggestionFlow = onFlow(
  ai,
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
    authPolicy: firebaseAuth((_context) => {
      // Authentication policy logic here
    }),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const prompt =
      `Suggest an item for the menu of a ${subject} themed restaurant`;
    const llmResponse = await ai.generate({
      model: "gpt-3.5-turbo",
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.
    return llmResponse.text;
  }
);
