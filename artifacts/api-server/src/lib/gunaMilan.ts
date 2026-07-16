/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ASHTAKOOT GUNA MILAN — classical 36-guna Vedic compatibility matching
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Computes all eight koots from the couple's REAL Moon rashis and nakshatras
 * (derived by the jyotish engine from their birth details) using the
 * classical tables — not AI guesses:
 *
 *   Varna (1) · Vashya (2) · Tara (3) · Yoni (4) ·
 *   Graha Maitri (5) · Gana (6) · Bhakoota (7) · Nadi (8)   = 36 max
 */

import { jdFromISO, grahaPositions, geocodeCity, NAKSHATRAS_EN, RASHIS_EN } from "./jyotish";

// ─── Varna (max 1) ────────────────────────────────────────────────────────────
// Brahmin: water signs · Kshatriya: fire · Vaishya: earth · Shudra: air
const VARNA_OF_RASHI = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]; // 0=Brahmin,1=Kshatriya,2=Vaishya,3=Shudra
const VARNA_NAMES = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"];

function varnaScore(boyRashi: number, girlRashi: number): number {
  // Boy's varna should be same or "higher" (lower index) than girl's
  return VARNA_OF_RASHI[boyRashi]! <= VARNA_OF_RASHI[girlRashi]! ? 1 : 0;
}

// ─── Vashya (max 2) ───────────────────────────────────────────────────────────
// 0=Chatushpada(quadruped) 1=Manav(human) 2=Jalachara(aquatic) 3=Vanachara(wild) 4=Keeta(insect)
const VASHYA_OF_RASHI = [0, 0, 1, 2, 3, 1, 1, 4, 1, 2, 1, 2];
const VASHYA_MATRIX: number[][] = [
  // boy ↓ / girl →  Chatu Manav Jala Vana Keeta
  /* Chatushpada */ [2,    1,   1,   0.5, 1],
  /* Manav       */ [1,    2,   0.5, 0,   1],
  /* Jalachara   */ [1,    0.5, 2,   1,   1],
  /* Vanachara   */ [0,    0,   1,   2,   0],
  /* Keeta       */ [1,    1,   1,   0,   2],
];

function vashyaScore(boyRashi: number, girlRashi: number): number {
  return VASHYA_MATRIX[VASHYA_OF_RASHI[boyRashi]!]![VASHYA_OF_RASHI[girlRashi]!]!;
}

// ─── Tara (max 3) ─────────────────────────────────────────────────────────────
// Count nakshatras (inclusive) each way; remainder mod 9 of 3,5,7 (Vipat,
// Pratyari, Vadha) is inauspicious. Each auspicious direction scores 1.5.
function taraScore(boyNak: number, girlNak: number): number {
  const countFrom = (from: number, to: number) => ((to - from + 27) % 27) + 1;
  const bad = (cnt: number) => [3, 5, 7].includes(cnt % 9 === 0 ? 9 : cnt % 9);
  let score = 0;
  if (!bad(countFrom(girlNak, boyNak))) score += 1.5;
  if (!bad(countFrom(boyNak, girlNak))) score += 1.5;
  return score;
}

// ─── Yoni (max 4) ─────────────────────────────────────────────────────────────
const YONI_NAMES = ["Ashwa","Gaja","Mesha","Sarpa","Shwan","Marjara","Mushaka","Gau","Mahisha","Vyaghra","Mriga","Vanara","Nakula","Simha"];
const YONI_OF_NAK = [
  0, 1, 2, 3, 3, 4, 5, 2, 5,     // Ashwini..Ashlesha
  6, 6, 7, 8, 9, 8, 9, 10, 10,   // Magha..Jyeshtha
  4, 11, 12, 11, 13, 0, 13, 7, 1 // Mula..Revati
];
// Classical 14×14 compatibility matrix (symmetric; 4=self, 0=sworn enemies)
const YONI_MATRIX: number[][] = [
  [4,2,2,3,2,2,2,1,0,1,3,3,2,1],
  [2,4,3,3,2,2,2,2,3,1,2,3,2,0],
  [2,3,4,2,1,2,1,3,3,1,2,0,3,1],
  [3,3,2,4,2,1,1,1,1,2,2,2,0,2],
  [2,2,1,2,4,2,1,2,2,1,0,2,1,1],
  [2,2,2,1,2,4,0,2,2,1,3,3,2,1],
  [2,2,1,1,1,0,4,2,2,2,2,2,1,2],
  [1,2,3,1,2,2,2,4,3,0,3,2,2,1],
  [0,3,3,1,2,2,2,3,4,1,2,2,2,1],
  [1,1,1,2,1,1,2,0,1,4,1,1,2,1],
  [3,2,2,2,0,3,2,3,2,1,4,2,2,1],
  [3,3,0,2,2,3,2,2,2,1,2,4,3,2],
  [2,2,3,0,1,2,1,2,2,2,2,3,4,2],
  [1,0,1,2,1,1,2,1,1,1,1,2,2,4],
];

function yoniScore(boyNak: number, girlNak: number): number {
  return YONI_MATRIX[YONI_OF_NAK[boyNak]!]![YONI_OF_NAK[girlNak]!]!;
}

// ─── Graha Maitri (max 5) ─────────────────────────────────────────────────────
const LORD_OF_RASHI = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
// 1 = friend, 0 = neutral, -1 = enemy (permanent relationships)
const FRIENDSHIP: Record<string, Record<string, number>> = {
  Sun:     { Sun: 1, Moon: 1, Mars: 1, Mercury: 0, Jupiter: 1, Venus: -1, Saturn: -1 },
  Moon:    { Sun: 1, Moon: 1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 0,  Saturn: 0 },
  Mars:    { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: 0, Saturn: 0 },
  Mercury: { Sun: 1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 0 },
  Jupiter: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: -1, Saturn: 0 },
  Venus:   { Sun: -1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
  Saturn:  { Sun: -1, Moon: -1, Mars: -1, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
};

function grahaMaitriScore(boyRashi: number, girlRashi: number): number {
  const lb = LORD_OF_RASHI[boyRashi]!;
  const lg = LORD_OF_RASHI[girlRashi]!;
  if (lb === lg) return 5;
  const a = FRIENDSHIP[lb]![lg]!;
  const b = FRIENDSHIP[lg]![lb]!;
  if (a === 1 && b === 1) return 5;
  if ((a === 1 && b === 0) || (a === 0 && b === 1)) return 4;
  if (a === 0 && b === 0) return 3;
  if ((a === 1 && b === -1) || (a === -1 && b === 1)) return 1;
  if ((a === 0 && b === -1) || (a === -1 && b === 0)) return 0.5;
  return 0; // both enemies
}

// ─── Gana (max 6) ─────────────────────────────────────────────────────────────
// 0=Deva 1=Manushya 2=Rakshasa
const GANA_OF_NAK = [
  0,1,2,1,0,1,0,0,2,   // Ashwini..Ashlesha
  2,1,1,0,2,0,2,0,2,   // Magha..Jyeshtha
  2,1,1,0,2,2,1,1,0    // Mula..Revati
];
const GANA_MATRIX: number[][] = [
  // boy ↓ / girl →  Deva Manushya Rakshasa
  /* Deva     */ [6, 6, 0],
  /* Manushya */ [5, 6, 0],
  /* Rakshasa */ [1, 0, 6],
];

function ganaScore(boyNak: number, girlNak: number): number {
  return GANA_MATRIX[GANA_OF_NAK[boyNak]!]![GANA_OF_NAK[girlNak]!]!;
}

// ─── Bhakoota (max 7) ─────────────────────────────────────────────────────────
// Rashi distance pairs 2/12, 5/9, 6/8 → 0; others → 7
function bhakootaScore(boyRashi: number, girlRashi: number): number {
  const d1 = ((girlRashi - boyRashi + 12) % 12) + 1;
  const d2 = ((boyRashi - girlRashi + 12) % 12) + 1;
  const bad = new Set([2, 12, 5, 9, 6, 8]);
  return bad.has(d1) && bad.has(d2) ? 0 : 7;
}

// ─── Nadi (max 8) ─────────────────────────────────────────────────────────────
// 0=Adi 1=Madhya 2=Antya (classical mapping)
const NADI_OF_NAK = [
  0,1,2,2,1,0,0,1,2,   // Ashwini..Ashlesha
  2,1,0,0,1,2,2,1,0,   // Magha..Jyeshtha
  0,1,2,2,1,0,0,1,2    // Mula..Revati
];

function nadiScore(boyNak: number, girlNak: number): number {
  return NADI_OF_NAK[boyNak] === NADI_OF_NAK[girlNak] ? 0 : 8;
}

// ─── Full Milan ───────────────────────────────────────────────────────────────

export interface MilanInput {
  dob: string;       // YYYY-MM-DD
  tob: string;       // HH:MM (IST)
  pob?: string | null;
}

export interface MilanResult {
  totalScore: number;
  maxScore: 36;
  varna: number; vashya: number; tara: number; yoni: number;
  grihaMaitri: number; gana: number; bhakoota: number; nadi: number;
  boy: { moonRashi: string; nakshatra: string; varna: string; yoni: string };
  girl: { moonRashi: string; nakshatra: string; varna: string; yoni: string };
  nadiDosha: boolean;
  bhakootaDosha: boolean;
  ganaDosha: boolean;
}

function moonOf(inp: MilanInput): { rashi: number; nak: number } {
  const geo = geocodeCity(inp.pob);
  void geo; // moon position is geocentric; place affects only lagna, not milan
  const jd = jdFromISO(inp.dob, inp.tob || "12:00");
  const moon = grahaPositions(jd).find((p) => p.planet === "Moon")!;
  return { rashi: moon.rashiIndex, nak: moon.nakshatraIndex };
}

export function gunaMilan(boy: MilanInput, girl: MilanInput): MilanResult {
  const b = moonOf(boy);
  const g = moonOf(girl);

  const varna = varnaScore(b.rashi, g.rashi);
  const vashya = vashyaScore(b.rashi, g.rashi);
  const tara = taraScore(b.nak, g.nak);
  const yoni = yoniScore(b.nak, g.nak);
  const maitri = grahaMaitriScore(b.rashi, g.rashi);
  const gana = ganaScore(b.nak, g.nak);
  const bhakoota = bhakootaScore(b.rashi, g.rashi);
  const nadi = nadiScore(b.nak, g.nak);

  const total = varna + vashya + tara + yoni + maitri + gana + bhakoota + nadi;

  return {
    totalScore: Math.round(total * 2) / 2,
    maxScore: 36,
    varna, vashya, tara, yoni,
    grihaMaitri: maitri, gana, bhakoota, nadi,
    boy: {
      moonRashi: RASHIS_EN[b.rashi]!, nakshatra: NAKSHATRAS_EN[b.nak]!,
      varna: VARNA_NAMES[VARNA_OF_RASHI[b.rashi]!]!, yoni: YONI_NAMES[YONI_OF_NAK[b.nak]!]!,
    },
    girl: {
      moonRashi: RASHIS_EN[g.rashi]!, nakshatra: NAKSHATRAS_EN[g.nak]!,
      varna: VARNA_NAMES[VARNA_OF_RASHI[g.rashi]!]!, yoni: YONI_NAMES[YONI_OF_NAK[g.nak]!]!,
    },
    nadiDosha: nadi === 0,
    bhakootaDosha: bhakoota === 0,
    ganaDosha: gana <= 1,
  };
}
