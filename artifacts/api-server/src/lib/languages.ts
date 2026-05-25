const NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  ur: "Urdu",
};

/**
 * Resolve a language code or full name into the canonical English language
 * name that we pass into AI prompts (e.g. "Hindi", "Tamil"). Accepts:
 *  - ISO-like codes ("hi", "ta", ...)
 *  - Full names ("Hindi", "Tamil", ...)
 *  - Anything unknown defaults to "English".
 */
export function resolveLanguageName(input: unknown): string {
  if (typeof input !== "string" || !input.trim()) return "English";
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (NAMES[lower]) return NAMES[lower];
  // Already a full name?
  const known = Object.values(NAMES).find(n => n.toLowerCase() === lower);
  if (known) return known;
  return "English";
}

const SCRIPT_HINTS: Record<string, string> = {
  Hindi: "Devanagari script (e.g. नमस्ते, मांगलिक दोष)",
  Bengali: "Bengali script",
  Tamil: "Tamil script",
  Telugu: "Telugu script",
  Marathi: "Devanagari script",
  Gujarati: "Gujarati script",
  Kannada: "Kannada script",
  Malayalam: "Malayalam script",
  Punjabi: "Gurmukhi script",
  Odia: "Odia script",
  Assamese: "Assamese script",
  Urdu: "Nastaliq (Arabic) script",
  English: "Latin/English script",
};

/**
 * Returns a strong, model-friendly instruction string forcing the AI to write
 * every JSON VALUE in the target language using its native script. JSON keys
 * always remain in English.
 */
export function languageInstruction(input: unknown): { lang: string; instruction: string } {
  const lang = resolveLanguageName(input);
  const script = SCRIPT_HINTS[lang] ?? `${lang} native script`;
  const instruction =
    lang === "English"
      ? "All JSON field values must be written in clear English."
      : `CRITICAL OUTPUT LANGUAGE: ${lang}. EVERY JSON field VALUE must be written entirely in ${lang} using ${script}. Do NOT use English words, Roman/Latin transliteration, or mixed languages in any value. Only the JSON keys remain in English. If a concept does not have a common ${lang} term, write it in ${lang} script (transliterate if absolutely necessary). Sanskrit mantras stay in Devanagari.`;
  return { lang, instruction };
}
