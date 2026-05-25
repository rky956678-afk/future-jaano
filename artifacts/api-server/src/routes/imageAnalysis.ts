import { resolveLanguageName } from "../lib/languages";
import { Router } from "express";
import { db, vastuTable, palmTable, faceTable, readingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

async function analyzeWithVision(imageBase64: string, systemPrompt: string, language: string) {
  const lang = resolveLanguageName(language);
  const scriptNote =
    lang === "Hindi"
      ? "All field VALUES must be written in Hindi using Devanagari script (e.g. ईशान कोण दोष). Do NOT use Roman/English transliteration for the values. Only JSON keys remain in English."
      : lang === "English"
      ? "All field values must be written in English."
      : `All field VALUES must be written in ${lang} using its native script. Do NOT use Roman/English transliteration. Only JSON keys remain in English.`;
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are a multilingual expert. CRITICAL OUTPUT LANGUAGE: ${lang}. ${scriptNote}`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "high" },
          },
          {
            type: "text",
            text: `${systemPrompt}\n\nREMINDER: Respond with JSON whose VALUES are written entirely in ${lang}. ${scriptNote}`,
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}

// POST /api/vastu/analyze
router.post("/vastu/analyze", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { imageBase64, roomType, language } = req.body;

    if (!imageBase64 || !roomType) {
      res.status(400).json({ error: "imageBase64 and roomType are required" });
      return;
    }

    const systemPrompt = `You are a Vastu Shastra expert. Analyze this ${roomType} image for Vastu compliance.

IMPORTANT: Identify SPECIFIC Vastu doshas (defects) visible in this image and provide targeted remedies (upaay) for EACH dosh.

Return JSON with this EXACT structure:
{
  "overallScore": number (1-100, based on severity of doshas found),
  "findings": "2-3 sentence overall Vastu assessment of this room",
  "positiveAspects": "Vastu-compliant elements visible in this room",
  "remedies": "General summary of all remedies",
  "colorRecommendations": "ideal colors per direction for this room",
  "directionAnalysis": "North/South/East/West/NE/NW/SE/SW analysis",
  "doshas": [
    {
      "name": "Dosh name (e.g. ईशान कोण दोष / Ishaan Kon Dosh)",
      "severity": "high" | "medium" | "low",
      "description": "What specific Vastu defect is present and why it is harmful",
      "upaay": "Specific remedy/correction to fix this dosh (e.g. place a crystal, use specific color, reposition furniture, plant specific plant)"
    }
  ]
}

Return between 2-6 doshas based on what you actually see. If a room is Vastu-compliant, return fewer doshas with low severity.
Each dosh MUST have a practical, actionable upaay.`;

    const aiResult = await analyzeWithVision(imageBase64, systemPrompt, language || "en");

    const doshas = Array.isArray(aiResult.doshas) ? aiResult.doshas : [];

    const [vastu] = await db.insert(vastuTable).values({
      userId: dbUser.id,
      roomType,
      overallScore: aiResult.overallScore || 65,
      findings: aiResult.findings || "Vastu analysis completed.",
      remedies: aiResult.remedies || "Follow standard Vastu principles.",
      positiveAspects: aiResult.positiveAspects,
      negativeAspects: JSON.stringify(doshas),
      colorRecommendations: aiResult.colorRecommendations,
      directionAnalysis: aiResult.directionAnalysis,
      language: language || "en",
    }).returning();

    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "vastu",
      summary: `Vastu analysis for ${roomType} - Score: ${aiResult.overallScore || 65}/100, ${doshas.length} doshas found`,
      isPremium: false,
    });

    res.status(201).json({
      id: vastu.id, roomType: vastu.roomType, overallScore: vastu.overallScore,
      findings: vastu.findings, remedies: vastu.remedies,
      doshas,
      positiveAspects: vastu.positiveAspects ?? null, negativeAspects: vastu.negativeAspects ?? null,
      colorRecommendations: vastu.colorRecommendations ?? null, directionAnalysis: vastu.directionAnalysis ?? null,
      language: vastu.language, createdAt: vastu.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error analyzing vastu");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/vastu/:id
router.get("/vastu/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [vastu] = await db.select().from(vastuTable).where(eq(vastuTable.id, id));
    if (!vastu) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: vastu.id, roomType: vastu.roomType, overallScore: vastu.overallScore,
      findings: vastu.findings, remedies: vastu.remedies,
      positiveAspects: vastu.positiveAspects ?? null, negativeAspects: vastu.negativeAspects ?? null,
      colorRecommendations: vastu.colorRecommendations ?? null, directionAnalysis: vastu.directionAnalysis ?? null,
      language: vastu.language, createdAt: vastu.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting vastu report");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/palm/analyze
router.post("/palm/analyze", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { imageBase64, language } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const systemPrompt = `You are an expert palmist. Analyze the palm lines in this image.
Return JSON:
{
  "lifeLine": "life line reading",
  "heartLine": "heart line reading",
  "headLine": "head line reading",
  "fateLine": "fate line reading",
  "sunLine": "sun line reading",
  "analysis": "comprehensive palm reading",
  "longevityPrediction": "longevity and health prediction",
  "careerPrediction": "career and success prediction",
  "lovePrediction": "love and marriage prediction",
  "fortunePrediction": "overall fortune prediction"
}`;

    const aiResult = await analyzeWithVision(imageBase64, systemPrompt, language || "en");

    const [palm] = await db.insert(palmTable).values({
      userId: dbUser.id,
      lifeLine: aiResult.lifeLine || "Strong and deep life line indicating vitality.",
      heartLine: aiResult.heartLine || "Clear heart line indicating emotional balance.",
      headLine: aiResult.headLine || "Well-defined head line indicating sharp intellect.",
      fateLine: aiResult.fateLine,
      sunLine: aiResult.sunLine,
      analysis: aiResult.analysis || "Palm reading analysis completed.",
      longevityPrediction: aiResult.longevityPrediction,
      careerPrediction: aiResult.careerPrediction,
      lovePrediction: aiResult.lovePrediction,
      fortunePrediction: aiResult.fortunePrediction,
      language: language || "en",
    }).returning();

    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "palm",
      summary: "Palm reading analysis completed",
      isPremium: false,
    });

    res.status(201).json({
      id: palm.id, lifeLine: palm.lifeLine, heartLine: palm.heartLine, headLine: palm.headLine,
      fateLine: palm.fateLine ?? null, sunLine: palm.sunLine ?? null, analysis: palm.analysis,
      longevityPrediction: palm.longevityPrediction ?? null, careerPrediction: palm.careerPrediction ?? null,
      lovePrediction: palm.lovePrediction ?? null, fortunePrediction: palm.fortunePrediction ?? null,
      language: palm.language, createdAt: palm.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error analyzing palm");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/palm/:id
router.get("/palm/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [palm] = await db.select().from(palmTable).where(eq(palmTable.id, id));
    if (!palm) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: palm.id, lifeLine: palm.lifeLine, heartLine: palm.heartLine, headLine: palm.headLine,
      fateLine: palm.fateLine ?? null, sunLine: palm.sunLine ?? null, analysis: palm.analysis,
      longevityPrediction: palm.longevityPrediction ?? null, careerPrediction: palm.careerPrediction ?? null,
      lovePrediction: palm.lovePrediction ?? null, fortunePrediction: palm.fortunePrediction ?? null,
      language: palm.language, createdAt: palm.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting palm report");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/face/analyze
router.post("/face/analyze", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { imageBase64, language } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const systemPrompt = `You are an expert in face reading (Samudrika Shastra). Analyze this face.
Return JSON:
{
  "faceShape": "face shape (oval/round/square/heart/rectangular)",
  "eyeAnalysis": "eye shape and meaning",
  "noseAnalysis": "nose shape and meaning",
  "lipsAnalysis": "lips shape and meaning",
  "foreheadAnalysis": "forehead analysis",
  "analysis": "comprehensive face reading",
  "personalityTraits": "personality traits revealed",
  "fortunePrediction": "fortune and destiny prediction",
  "healthIndicators": "health indicators from face"
}`;

    const aiResult = await analyzeWithVision(imageBase64, systemPrompt, language || "en");

    const [face] = await db.insert(faceTable).values({
      userId: dbUser.id,
      faceShape: aiResult.faceShape || "Oval",
      eyeAnalysis: aiResult.eyeAnalysis || "Bright and expressive eyes indicating intelligence.",
      noseAnalysis: aiResult.noseAnalysis || "Well-proportioned nose indicating good fortune.",
      lipsAnalysis: aiResult.lipsAnalysis,
      foreheadAnalysis: aiResult.foreheadAnalysis,
      analysis: aiResult.analysis || "Face reading analysis completed.",
      personalityTraits: aiResult.personalityTraits,
      fortunePrediction: aiResult.fortunePrediction,
      healthIndicators: aiResult.healthIndicators,
      language: language || "en",
    }).returning();

    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "face",
      summary: "Face reading analysis completed",
      isPremium: false,
    });

    res.status(201).json({
      id: face.id, faceShape: face.faceShape, eyeAnalysis: face.eyeAnalysis, noseAnalysis: face.noseAnalysis,
      lipsAnalysis: face.lipsAnalysis ?? null, foreheadAnalysis: face.foreheadAnalysis ?? null,
      analysis: face.analysis, personalityTraits: face.personalityTraits ?? null,
      fortunePrediction: face.fortunePrediction ?? null, healthIndicators: face.healthIndicators ?? null,
      language: face.language, createdAt: face.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error analyzing face");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/face/:id
router.get("/face/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [face] = await db.select().from(faceTable).where(eq(faceTable.id, id));
    if (!face) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: face.id, faceShape: face.faceShape, eyeAnalysis: face.eyeAnalysis, noseAnalysis: face.noseAnalysis,
      lipsAnalysis: face.lipsAnalysis ?? null, foreheadAnalysis: face.foreheadAnalysis ?? null,
      analysis: face.analysis, personalityTraits: face.personalityTraits ?? null,
      fortunePrediction: face.fortunePrediction ?? null, healthIndicators: face.healthIndicators ?? null,
      language: face.language, createdAt: face.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting face report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
