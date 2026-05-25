import { languageInstruction } from "../lib/languages";
import { Router } from "express";
import { db, numerologyTable, readingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { openai } from "../lib/openai";

const router = Router();

function calculateLifePathNumber(dob: string): number {
  const digits = dob.replace(/\D/g, "");
  let sum = digits.split("").reduce((acc, d) => acc + parseInt(d), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split("").reduce((acc, d) => acc + parseInt(d), 0);
  }
  return sum;
}

function calculateDestinyNumber(name: string): number {
  const letterValues: Record<string, number> = {
    a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8
  };
  const sum = name.toLowerCase().split("").filter(c => /[a-z]/.test(c)).reduce((acc, c) => acc + (letterValues[c] || 0), 0);
  let n = sum;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split("").reduce((acc, d) => acc + parseInt(d), 0);
  }
  return n;
}

async function generateNumerologyAnalysis(fullName: string, dateOfBirth: string, lifePathNumber: number, destinyNumber: number, language: string) {
  const { lang, instruction } = languageInstruction(language);
  const prompt = `You are a numerology expert.

${instruction}

Generate a complete numerology analysis for:
Name: ${fullName}
Date of Birth: ${dateOfBirth}
Life Path Number: ${lifePathNumber}
Destiny Number: ${destinyNumber}

Return JSON:
{
  "soulUrgeNumber": number,
  "personalityNumber": number,
  "birthdayNumber": number,
  "analysis": "comprehensive numerology reading",
  "strengths": "key strengths revealed by numbers",
  "challenges": "challenges to overcome",
  "luckyYears": "upcoming lucky years and why",
  "compatibleNumbers": "compatible life path numbers"
}

FINAL REMINDER: Every text value must be in ${lang}. ${instruction}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

// POST /api/numerology
router.post("/numerology", requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { fullName, dateOfBirth, language } = req.body;

    if (!fullName || !dateOfBirth) {
      res.status(400).json({ error: "fullName and dateOfBirth are required" });
      return;
    }

    const lifePathNumber = calculateLifePathNumber(dateOfBirth);
    const destinyNumber = calculateDestinyNumber(fullName);

    const aiResult = await generateNumerologyAnalysis(fullName, dateOfBirth, lifePathNumber, destinyNumber, language || "en");

    const [numerology] = await db.insert(numerologyTable).values({
      userId: dbUser.id,
      fullName,
      dateOfBirth,
      lifePathNumber,
      destinyNumber,
      soulUrgeNumber: aiResult.soulUrgeNumber || null,
      personalityNumber: aiResult.personalityNumber || null,
      birthdayNumber: aiResult.birthdayNumber || null,
      analysis: aiResult.analysis || "Numerology analysis completed.",
      strengths: aiResult.strengths,
      challenges: aiResult.challenges,
      luckyYears: aiResult.luckyYears,
      compatibleNumbers: aiResult.compatibleNumbers,
      language: language || "en",
    }).returning();

    await db.insert(readingsTable).values({
      userId: dbUser.id,
      type: "numerology",
      summary: `Numerology for ${fullName} - Life Path ${lifePathNumber}`,
      isPremium: false,
    });

    res.status(201).json({
      id: numerology.id, fullName: numerology.fullName, dateOfBirth: numerology.dateOfBirth,
      lifePathNumber: numerology.lifePathNumber, destinyNumber: numerology.destinyNumber,
      soulUrgeNumber: numerology.soulUrgeNumber ?? null, personalityNumber: numerology.personalityNumber ?? null,
      birthdayNumber: numerology.birthdayNumber ?? null, analysis: numerology.analysis,
      strengths: numerology.strengths ?? null, challenges: numerology.challenges ?? null,
      luckyYears: numerology.luckyYears ?? null, compatibleNumbers: numerology.compatibleNumbers ?? null,
      language: numerology.language, createdAt: numerology.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating numerology report");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/numerology/:id
router.get("/numerology/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params["id"] as string);
    const [numerology] = await db.select().from(numerologyTable).where(eq(numerologyTable.id, id));
    if (!numerology) { res.status(404).json({ error: "Not found" }); return; }
    res.json({
      id: numerology.id, fullName: numerology.fullName, dateOfBirth: numerology.dateOfBirth,
      lifePathNumber: numerology.lifePathNumber, destinyNumber: numerology.destinyNumber,
      soulUrgeNumber: numerology.soulUrgeNumber ?? null, personalityNumber: numerology.personalityNumber ?? null,
      birthdayNumber: numerology.birthdayNumber ?? null, analysis: numerology.analysis,
      strengths: numerology.strengths ?? null, challenges: numerology.challenges ?? null,
      luckyYears: numerology.luckyYears ?? null, compatibleNumbers: numerology.compatibleNumbers ?? null,
      language: numerology.language, createdAt: numerology.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting numerology report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
