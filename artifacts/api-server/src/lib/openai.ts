import OpenAI from "openai";
import { logger } from "./logger";

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_API_BASE_URL;

if (!apiKey) {
  console.warn("[openai] WARNING: OPENAI_API_KEY is not set. AI features will use built-in fallback content.");
}

// Lazy client — only usable when OPENAI_API_KEY is set
export const openai = apiKey
  ? new OpenAI({ apiKey, ...(baseURL && { baseURL }) })
  : (null as unknown as OpenAI);

export function isOpenAIConfigured(): boolean {
  return !!apiKey;
}

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

/**
 * Call OpenAI expecting a JSON object response. If OpenAI is not configured,
 * or the call fails for any reason (network, quota, bad JSON), the provided
 * fallback object is returned instead — so every feature keeps working even
 * without an API key.
 *
 * The parsed AI result is merged ON TOP of the fallback, so any fields the
 * model forgets are still present.
 */
export async function aiJson<T extends Record<string, unknown>>(
  messages: ChatMessage[],
  fallback: T,
  model = "gpt-4o-mini",
): Promise<T> {
  if (!apiKey) return fallback;
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return { ...fallback, ...parsed };
  } catch (err) {
    logger.warn({ err }, "[openai] AI call failed — serving fallback content");
    return fallback;
  }
}
