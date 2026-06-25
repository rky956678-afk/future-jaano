import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_API_BASE_URL;

if (!apiKey) {
  console.warn("[openai] WARNING: OPENAI_API_KEY is not set. AI features will be disabled.");
}

// Lazy client — only usable when OPENAI_API_KEY is set
export const openai = apiKey
  ? new OpenAI({ apiKey, ...(baseURL && { baseURL }) })
  : (null as unknown as OpenAI);

export function isOpenAIConfigured(): boolean {
  return !!apiKey;
}
