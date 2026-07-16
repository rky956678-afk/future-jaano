import { Router } from "express";
import {
  panchang as computePanchang,
  inauspiciousWindows,
  geocodeCity,
  jdFromISO,
  RASHIS_EN, RASHIS_HI, NAKSHATRAS_HI,
} from "../lib/jyotish";

const router = Router();

const VAARAS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const TITHI_HI: Record<string, string> = {
  Pratipada: "प्रतिपदा", Dwitiya: "द्वितीया", Tritiya: "तृतीया", Chaturthi: "चतुर्थी",
  Panchami: "पंचमी", Shashthi: "षष्ठी", Saptami: "सप्तमी", Ashtami: "अष्टमी",
  Navami: "नवमी", Dashami: "दशमी", Ekadashi: "एकादशी", Dwadashi: "द्वादशी",
  Trayodashi: "त्रयोदशी", Chaturdashi: "चतुर्दशी", Purnima: "पूर्णिमा", Amavasya: "अमावस्या",
};

const FESTIVALS: Record<string, string> = {
  "01-14": "Makar Sankranti", "01-26": "Republic Day",
  "03-25": "Holi", "04-14": "Ram Navami",
  "08-15": "Independence Day", "09-05": "Ganesh Chaturthi",
  "10-02": "Gandhi Jayanti", "10-24": "Diwali",
  "11-01": "Diwali (Laxmi Puja)", "12-25": "Christmas",
};

// Simple per-day+location cache — panchang for a given day/place never changes
const cache = new Map<string, unknown>();

function getPanchang(dateStr: string, place?: string, latQ?: string, lonQ?: string) {
  const geo = geocodeCity(place);
  const lat = latQ ? parseFloat(latQ) : geo.lat;
  const lon = lonQ ? parseFloat(lonQ) : geo.lon;

  const key = `${dateStr}:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);

  // Panchang elements evaluated at local sunrise-ish (6 AM IST) per convention,
  // muhurta windows from the real sunrise/sunset at the location.
  const jd = jdFromISO(dateStr, "06:00");
  const p = computePanchang(jd);
  const date = new Date(dateStr + "T06:00:00");
  const weekDay = date.getDay();
  const windows = inauspiciousWindows(dateStr, weekDay, lat, lon);

  // Hindi tithi label
  const baseTithi = p.tithiName.replace(/^(Shukla|Krishna) /, "");
  const pakshaHi = p.paksha === "Shukla" ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
  const tithiLabel =
    baseTithi === "Purnima" || baseTithi === "Amavasya"
      ? `${baseTithi} (${TITHI_HI[baseTithi]})`
      : `${p.tithiName} (${pakshaHi} ${TITHI_HI[baseTithi] || baseTithi})`;

  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const result = {
    date: dateStr,
    tithi: tithiLabel,
    nakshatra: `${p.nakshatraName} (${NAKSHATRAS_HI[p.nakshatraIndex]})`,
    yoga: p.yogaName,
    karan: p.karanaName,
    vaara: VAARAS[weekDay],
    sunrise: windows.sunrise,
    sunset: windows.sunset,
    rahuKaal: windows.rahuKaal,
    yamaghanta: windows.yamaghanta,
    gulikaKaal: windows.gulikaKaal,
    abhijitMuhurat: windows.abhijitMuhurat,
    moonRashi: `${RASHIS_EN[p.moonRashiIndex]} (${RASHIS_HI[p.moonRashiIndex]})`,
    sunRashi: `${RASHIS_EN[p.sunRashiIndex]} (${RASHIS_HI[p.sunRashiIndex]})`,
    festivals: FESTIVALS[mmdd] || "",
    location: place || geo.matched,
  };
  cache.set(key, result);
  if (cache.size > 2000) cache.clear();
  return result;
}

// GET /api/panchang?date=YYYY-MM-DD&place=Lucknow (or &lat=..&lon=..)
router.get("/panchang", (req, res) => {
  try {
    const dateStr = (req.query["date"] as string) || new Date(Date.now() + 5.5 * 3600000).toISOString().split("T")[0]!;
    const place = req.query["place"] as string | undefined;
    const data = getPanchang(dateStr, place, req.query["lat"] as string, req.query["lon"] as string);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error getting panchang");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
