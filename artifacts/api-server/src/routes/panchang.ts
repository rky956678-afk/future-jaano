import { Router } from "express";

const router = Router();

const TITHIS = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
  "Shashthi","Saptami","Ashtami","Navami","Dashami",
  "Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima/Amavasya",
];
const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni",
  "Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati",
];
const YOGAS = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarman",
  "Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra",
  "Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha",
  "Shukla","Brahma","Indra","Vaidhriti",
];
const KARANS = [
  "Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti",
  "Shakuni","Chatushpada","Naga","Kimstughna",
];
const RASHIS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];
const RASHIS_HI = [
  "मेष","वृष","मिथुन","कर्क","सिंह","कन्या",
  "तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन",
];
const VAARAS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const RAHU_KAAL: Record<number, string> = {
  0: "4:30 PM - 6:00 PM", 1: "7:30 AM - 9:00 AM",
  2: "3:00 PM - 4:30 PM", 3: "12:00 PM - 1:30 PM",
  4: "1:30 PM - 3:00 PM", 5: "10:30 AM - 12:00 PM",
  6: "9:00 AM - 10:30 AM",
};
const YAMGHANTA: Record<number, string> = {
  0: "12:00 PM - 1:30 PM", 1: "10:30 AM - 12:00 PM",
  2: "9:00 AM - 10:30 AM", 3: "7:30 AM - 9:00 AM",
  4: "6:00 AM - 7:30 AM", 5: "3:00 PM - 4:30 PM",
  6: "1:30 PM - 3:00 PM",
};
const GULIKA: Record<number, string> = {
  0: "3:00 PM - 4:30 PM", 1: "1:30 PM - 3:00 PM",
  2: "12:00 PM - 1:30 PM", 3: "10:30 AM - 12:00 PM",
  4: "9:00 AM - 10:30 AM", 5: "7:30 AM - 9:00 AM",
  6: "6:00 AM - 7:30 AM",
};

const FESTIVALS: Record<string, string> = {
  "01-14": "Makar Sankranti","01-26": "Republic Day",
  "03-25": "Holi","04-14": "Ram Navami",
  "08-15": "Independence Day","09-05": "Ganesh Chaturthi",
  "10-02": "Gandhi Jayanti","10-24": "Diwali",
  "11-01": "Diwali (Laxmi Puja)","12-25": "Christmas",
};

function getPanchang(dateStr: string) {
  const date = new Date(dateStr + "T06:00:00");
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const weekDay = date.getDay();

  const tithi = TITHIS[dayOfYear % 15];
  const nakshatra = NAKSHATRAS[dayOfYear % 27];
  const yoga = YOGAS[dayOfYear % 27];
  const karan = KARANS[dayOfYear % 11];
  const vaara = VAARAS[weekDay];
  const moonRashiIdx = Math.floor(dayOfYear / 2.25) % 12;
  const sunRashiIdx = Math.floor((date.getMonth() + (date.getDate() > 14 ? 0.5 : 0))) % 12;

  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const festival = FESTIVALS[mmdd] || "";

  return {
    date: dateStr,
    tithi: tithi!,
    nakshatra: nakshatra!,
    yoga: yoga!,
    karan: karan!,
    vaara,
    sunrise: "6:10 AM",
    sunset: "6:35 PM",
    rahuKaal: RAHU_KAAL[weekDay]!,
    yamaghanta: YAMGHANTA[weekDay]!,
    gulikaKaal: GULIKA[weekDay]!,
    abhijitMuhurat: "11:51 AM - 12:41 PM",
    moonRashi: `${RASHIS[moonRashiIdx]} (${RASHIS_HI[moonRashiIdx]})`,
    sunRashi: `${RASHIS[sunRashiIdx]} (${RASHIS_HI[sunRashiIdx]})`,
    festivals: festival,
  };
}

// GET /api/panchang
router.get("/panchang", (req, res) => {
  try {
    const dateStr = (req.query["date"] as string) || new Date().toISOString().split("T")[0]!;
    const data = getPanchang(dateStr);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Error getting panchang");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
