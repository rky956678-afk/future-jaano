/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  JYOTISH ENGINE — Real Vedic astronomical calculations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Replaces all "approximate/simplified" astrology math with genuine
 * astronomical computation:
 *
 *  • Planetary positions (Sun, Moon, Mars…Saturn, Rahu/Ketu) via analytic
 *    orbital theory (Schlyter/Meeus low-precision series, ≈ arc-minute level
 *    for Sun/Moon, well within rashi/nakshatra accuracy for all planets)
 *  • Lahiri ayanamsa → sidereal (nirayana) longitudes used throughout
 *  • Real Panchang: tithi, nakshatra, yoga, karana from actual Sun–Moon angles
 *  • Real sunrise/sunset per location → accurate Rahu Kaal / Yamaganda /
 *    Gulika / Abhijit muhurat windows
 *  • Ascendant (Lagna) from birth date-time + place via sidereal time
 *  • Vimshottari Mahadasha/Antardasha from the Moon's actual nakshatra
 *    with classical balance-of-dasha calculation
 *  • Bhinnashtakavarga + Sarvashtakavarga using the classical BPHS benefic
 *    tables (validated: Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56,
 *    Venus 52, Saturn 39 → total 337 bindus)
 *
 * All birth/local times are interpreted as IST (UTC+5:30) — this is an
 * India-first platform. Pass `utcOffsetHours` to override.
 */

// ─── Basic math helpers ───────────────────────────────────────────────────────

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function norm360(x: number): number {
  x = x % 360;
  return x < 0 ? x + 360 : x;
}
const sinD = (x: number) => Math.sin(x * D2R);
const cosD = (x: number) => Math.cos(x * D2R);
const tanD = (x: number) => Math.tan(x * D2R);
const atan2D = (y: number, x: number) => norm360(Math.atan2(y, x) * R2D);

// ─── Time ─────────────────────────────────────────────────────────────────────

export const IST_OFFSET = 5.5;

/** Julian Day (UT) from a local date/time. */
export function julianDay(
  year: number, month: number, day: number,
  hour = 12, minute = 0,
  utcOffsetHours = IST_OFFSET,
): number {
  const h = hour + minute / 60 - utcOffsetHours; // → UT
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5 + h / 24;
}

export function jdFromISO(dateISO: string, timeHHMM = "12:00", utcOffsetHours = IST_OFFSET): number {
  const [y, m, d] = dateISO.split("-").map(Number) as [number, number, number];
  const [hh, mm] = timeHHMM.split(":").map(Number) as [number, number];
  return julianDay(y, m, d, hh || 12, mm || 0, utcOffsetHours);
}

/** Lahiri ayanamsa (Chitrapaksha), linear approximation around J2000. */
export function ayanamsa(jd: number): number {
  // Lahiri on 2000-01-01 ≈ 23°51′11″; precession rate ≈ 50.29″/yr
  return 23.85305 + ((jd - 2451545.0) / 365.25) * (50.29 / 3600);
}

// ─── Kepler orbit solver ──────────────────────────────────────────────────────

function keplerE(M: number, e: number): number {
  // M in degrees, returns eccentric anomaly in degrees
  let E = M + R2D * e * sinD(M) * (1 + e * cosD(M));
  for (let i = 0; i < 8; i++) {
    const dE = (E - R2D * e * sinD(E) - M) / (1 - e * cosD(E));
    E -= dE;
    if (Math.abs(dE) < 1e-7) break;
  }
  return E;
}

// ─── Sun (geocentric, tropical ecliptic longitude) ────────────────────────────

function sunState(d: number): { lon: number; r: number; M: number } {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = norm360(356.047 + 0.9856002585 * d);
  const E = keplerE(M, e);
  const x = cosD(E) - e;
  const y = sinD(E) * Math.sqrt(1 - e * e);
  const v = atan2D(y, x);
  const r = Math.sqrt(x * x + y * y);
  return { lon: norm360(v + w), r, M };
}

export function sunLongitude(jd: number): number {
  return sunState(jd - 2451543.5).lon;
}

// ─── Moon (geocentric, tropical, with main perturbations) ────────────────────

export function moonLongitude(jd: number): number {
  const d = jd - 2451543.5;
  const N = norm360(125.1228 - 0.0529538083 * d);
  const i = 5.1454;
  const w = norm360(318.0634 + 0.1643573223 * d);
  const e = 0.0549;
  const M = norm360(115.3654 + 13.0649929509 * d);

  const E = keplerE(M, e);
  const xv = cosD(E) - e;
  const yv = sinD(E) * Math.sqrt(1 - e * e);
  const v = atan2D(yv, xv);

  const xh = cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i);
  const yh = sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i);
  let lon = atan2D(yh, xh);

  // Perturbation arguments
  const sun = sunState(d);
  const Ls = norm360(sun.M + 282.9404 + 4.70935e-5 * d); // Sun mean longitude
  const Lm = norm360(N + w + M);                          // Moon mean longitude
  const Ms = sun.M;                                       // Sun mean anomaly
  const Mm = M;                                           // Moon mean anomaly
  const D = norm360(Lm - Ls);                             // elongation
  const F = norm360(Lm - N);                              // argument of latitude

  lon +=
    -1.274 * sinD(Mm - 2 * D) +   // Evection
    +0.658 * sinD(2 * D) +        // Variation
    -0.186 * sinD(Ms) +           // Yearly equation
    -0.059 * sinD(2 * Mm - 2 * D) +
    -0.057 * sinD(Mm - 2 * D + Ms) +
    +0.053 * sinD(Mm + 2 * D) +
    +0.046 * sinD(2 * D - Ms) +
    +0.041 * sinD(Mm - Ms) +
    -0.035 * sinD(D) +            // Parallactic equation
    -0.031 * sinD(Mm + Ms) +
    -0.015 * sinD(2 * F - 2 * D) +
    +0.011 * sinD(Mm - 4 * D);

  return norm360(lon);
}

// ─── Planets (geocentric tropical longitudes) ────────────────────────────────

type Elements = { N: number; i: number; w: number; a: number; e: number; M: number };

function elements(planet: string, d: number): Elements {
  switch (planet) {
    case "Mercury": return {
      N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5.0e-8 * d, w: 29.1241 + 1.01444e-5 * d,
      a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: norm360(168.6562 + 4.0923344368 * d) };
    case "Venus": return {
      N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d,
      a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: norm360(48.0052 + 1.6021302244 * d) };
    case "Mars": return {
      N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d,
      a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: norm360(18.6021 + 0.5240207766 * d) };
    case "Jupiter": return {
      N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d,
      a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: norm360(19.895 + 0.0830853001 * d) };
    case "Saturn": return {
      N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d,
      a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: norm360(316.967 + 0.0334442282 * d) };
    default: throw new Error(`unknown planet ${planet}`);
  }
}

function planetLongitude(planet: string, jd: number): number {
  const d = jd - 2451543.5;
  const el = elements(planet, d);
  const E = keplerE(el.M, el.e);
  const xv = el.a * (cosD(E) - el.e);
  const yv = el.a * (sinD(E) * Math.sqrt(1 - el.e * el.e));
  const v = atan2D(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  // Heliocentric ecliptic coords
  let xh = r * (cosD(el.N) * cosD(v + el.w) - sinD(el.N) * sinD(v + el.w) * cosD(el.i));
  let yh = r * (sinD(el.N) * cosD(v + el.w) + cosD(el.N) * sinD(v + el.w) * cosD(el.i));
  const zh = r * sinD(v + el.w) * sinD(el.i);

  // Major Jupiter/Saturn mutual perturbations (Schlyter)
  if (planet === "Jupiter" || planet === "Saturn") {
    const Mj = elements("Jupiter", d).M;
    const Msat = elements("Saturn", d).M;
    let dLon = 0;
    if (planet === "Jupiter") {
      dLon =
        -0.332 * sinD(2 * Mj - 5 * Msat - 67.6) - 0.056 * sinD(2 * Mj - 2 * Msat + 21) +
        +0.042 * sinD(3 * Mj - 5 * Msat + 21) - 0.036 * sinD(Mj - 2 * Msat) +
        +0.022 * cosD(Mj - Msat) + 0.023 * sinD(2 * Mj - 3 * Msat + 52) -
        0.016 * sinD(Mj - 5 * Msat - 69);
    } else {
      dLon =
        +0.812 * sinD(2 * Mj - 5 * Msat - 67.6) - 0.229 * cosD(2 * Mj - 4 * Msat - 2) +
        +0.119 * sinD(Mj - 2 * Msat - 3) + 0.046 * sinD(2 * Mj - 6 * Msat - 69) +
        +0.014 * sinD(Mj - 3 * Msat + 32);
    }
    const helioLon = atan2D(yh, xh) + dLon;
    const rr = Math.sqrt(xh * xh + yh * yh);
    xh = rr * cosD(helioLon);
    yh = rr * sinD(helioLon);
  }

  // → geocentric: add the Sun's position
  const sun = sunState(d);
  const xs = sun.r * cosD(sun.lon);
  const ys = sun.r * sinD(sun.lon);
  const xg = xh + xs;
  const yg = yh + ys;
  void zh;
  return atan2D(yg, xg);
}

/** Mean lunar node (Rahu); Ketu is opposite. */
export function rahuLongitude(jd: number): number {
  const d = jd - 2451543.5;
  return norm360(125.1228 - 0.0529538083 * d);
}

// ─── Sidereal positions of all 9 grahas ───────────────────────────────────────

export interface GrahaPosition {
  planet: string;
  planetHi: string;
  siderealLon: number;   // 0–360 nirayana
  rashiIndex: number;    // 0=Mesha … 11=Meena
  degreeInRashi: number; // 0–30
  nakshatraIndex: number;// 0=Ashwini … 26=Revati
  pada: number;          // 1–4
  isRetrograde: boolean;
}

export const RASHIS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export const RASHIS_HI = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];
export const NAKSHATRAS_EN = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha",
  "Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati",
];
export const NAKSHATRAS_HI = [
  "अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशिरा","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा",
  "मघा","पूर्वा फाल्गुनी","उत्तरा फाल्गुनी","हस्त","चित्रा","स्वाति","विशाखा","अनुराधा","ज्येष्ठा",
  "मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा","पूर्वा भाद्रपद","उत्तरा भाद्रपद","रेवती",
];
const PLANET_HI: Record<string, string> = {
  Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध",
  Jupiter: "बृहस्पति", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु",
};

function tropicalLongitude(planet: string, jd: number): number {
  switch (planet) {
    case "Sun":  return sunLongitude(jd);
    case "Moon": return moonLongitude(jd);
    case "Rahu": return rahuLongitude(jd);
    case "Ketu": return norm360(rahuLongitude(jd) + 180);
    default:     return planetLongitude(planet, jd);
  }
}

export function grahaPositions(jd: number): GrahaPosition[] {
  const ayan = ayanamsa(jd);
  const planets = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
  return planets.map((p) => {
    const tropNow = tropicalLongitude(p, jd);
    const sid = norm360(tropNow - ayan);
    // Retrograde: compare with position 1 day later (nodes are always retrograde)
    let retro = p === "Rahu" || p === "Ketu";
    if (!retro && p !== "Sun" && p !== "Moon") {
      const tropNext = tropicalLongitude(p, jd + 1);
      let delta = tropNext - tropNow;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      retro = delta < 0;
    }
    return {
      planet: p,
      planetHi: PLANET_HI[p]!,
      siderealLon: sid,
      rashiIndex: Math.floor(sid / 30),
      degreeInRashi: sid % 30,
      nakshatraIndex: Math.floor(sid / (360 / 27)),
      pada: (Math.floor(sid / (360 / 108)) % 4) + 1,
      isRetrograde: retro,
    };
  });
}

// ─── Ascendant (Lagna) ────────────────────────────────────────────────────────

export function ascendantSidereal(jd: number, latDeg: number, lonDegEast: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst = norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T);
  const lst = norm360(gmst + lonDegEast); // RAMC in degrees
  const eps = 23.4393 - 0.0000004 * (jd - 2451543.5); // mean obliquity
  const y = cosD(lst);
  const x = -(sinD(lst) * cosD(eps) + tanD(latDeg) * sinD(eps));
  const ascTropical = atan2D(y, x);
  return norm360(ascTropical - ayanamsa(jd));
}

// ─── Panchang ─────────────────────────────────────────────────────────────────

export const TITHI_EN = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami",
  "Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi",
];
export const YOGA_EN = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarman","Dhriti","Shula",
  "Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan","Parigha",
  "Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti",
];
const MOVABLE_KARANAS = ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti"];
const FIXED_KARANAS   = ["Shakuni","Chatushpada","Naga","Kimstughna"];

export interface PanchangData {
  tithiIndex: number;      // 0..29
  tithiName: string;       // "Shukla Panchami" style
  paksha: "Shukla" | "Krishna";
  nakshatraIndex: number;
  nakshatraName: string;
  yogaIndex: number;
  yogaName: string;
  karanaName: string;
  moonRashiIndex: number;
  sunRashiIndex: number;
}

export function panchang(jd: number): PanchangData {
  const ayan = ayanamsa(jd);
  const sunSid = norm360(sunLongitude(jd) - ayan);
  const moonSid = norm360(moonLongitude(jd) - ayan);

  const elong = norm360(moonSid - sunSid);
  const tithiIndex = Math.floor(elong / 12);          // 0..29
  const paksha: "Shukla" | "Krishna" = tithiIndex < 15 ? "Shukla" : "Krishna";
  const tithiInPaksha = tithiIndex % 15;
  const tithiName =
    tithiIndex === 14 ? "Purnima" :
    tithiIndex === 29 ? "Amavasya" :
    `${paksha} ${TITHI_EN[tithiInPaksha]}`;

  const nakIdx = Math.floor(moonSid / (360 / 27));
  const yogaIdx = Math.floor(norm360(moonSid + sunSid) / (360 / 27));

  // Karana: half-tithis. #0 (first half of Shukla Pratipada) = Kimstughna,
  // then 8 cycles of the 7 movable karanas, then Shakuni/Chatushpada/Naga.
  const half = Math.floor(elong / 6); // 0..59
  let karanaName: string;
  if (half === 0) karanaName = "Kimstughna";
  else if (half >= 57) karanaName = FIXED_KARANAS[half - 57]!;
  else karanaName = MOVABLE_KARANAS[(half - 1) % 7]!;

  return {
    tithiIndex, tithiName, paksha,
    nakshatraIndex: nakIdx, nakshatraName: NAKSHATRAS_EN[nakIdx]!,
    yogaIndex: yogaIdx, yogaName: YOGA_EN[yogaIdx]!,
    karanaName,
    moonRashiIndex: Math.floor(moonSid / 30),
    sunRashiIndex: Math.floor(sunSid / 30),
  };
}

// ─── Sunrise / Sunset / muhurta windows ──────────────────────────────────────

function fmtTime(hoursLocal: number): string {
  let h = ((hoursLocal % 24) + 24) % 24;
  const m = Math.round((h - Math.floor(h)) * 60);
  h = Math.floor(h) + (m === 60 ? 1 : 0);
  const mm = m === 60 ? 0 : m;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

export interface SunTimes {
  sunriseH: number; sunsetH: number;     // local decimal hours
  sunrise: string; sunset: string;       // formatted
  solarNoonH: number;
}

export function sunTimes(dateISO: string, latDeg: number, lonDegEast: number, utcOffsetHours = IST_OFFSET): SunTimes {
  const jdNoon = jdFromISO(dateISO, "12:00", utcOffsetHours);
  const lonSun = sunLongitude(jdNoon);
  const decl = Math.asin(sinD(lonSun) * sinD(23.4393)) * R2D;

  // Equation of time (approx, minutes)
  const [y, m, d] = dateISO.split("-").map(Number) as [number, number, number];
  const N = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000) + 1;
  const B = (360 * (N - 81)) / 365;
  const eotMin = 9.87 * sinD(2 * B) - 7.53 * cosD(B) - 1.5 * sinD(B);

  const tzMeridian = utcOffsetHours * 15;
  const solarNoonH = 12 - eotMin / 60 - (lonDegEast - tzMeridian) / 15;

  const cosH = (sinD(-0.833) - sinD(latDeg) * sinD(decl)) / (cosD(latDeg) * cosD(decl));
  const H = Math.acos(Math.min(1, Math.max(-1, cosH))) * R2D; // deg
  const halfDay = H / 15; // hours

  const sunriseH = solarNoonH - halfDay;
  const sunsetH = solarNoonH + halfDay;
  return { sunriseH, sunsetH, sunrise: fmtTime(sunriseH), sunset: fmtTime(sunsetH), solarNoonH };
}

/** Rahu Kaal / Yamaganda / Gulika segments from REAL day length (day/8). */
export function inauspiciousWindows(dateISO: string, weekday: number, latDeg: number, lonDegEast: number) {
  const st = sunTimes(dateISO, latDeg, lonDegEast);
  const seg = (st.sunsetH - st.sunriseH) / 8;
  const win = (idx: number) => `${fmtTime(st.sunriseH + seg * idx)} - ${fmtTime(st.sunriseH + seg * (idx + 1))}`;
  // Classical segment numbers per weekday (0=Sunday)
  const RAHU  = [7, 1, 6, 4, 5, 3, 2];
  const YAMA  = [4, 3, 2, 1, 0, 6, 5];
  const GULI  = [6, 5, 4, 3, 2, 1, 0];
  const abhijitStart = st.solarNoonH - 24 / 60;
  const abhijitEnd   = st.solarNoonH + 24 / 60;
  return {
    sunrise: st.sunrise, sunset: st.sunset,
    rahuKaal:   win(RAHU[weekday]!),
    yamaghanta: win(YAMA[weekday]!),
    gulikaKaal: win(GULI[weekday]!),
    abhijitMuhurat: `${fmtTime(abhijitStart)} - ${fmtTime(abhijitEnd)}`,
  };
}

// ─── Vimshottari Dasha (real, from Moon's nakshatra) ─────────────────────────

const DASHA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
const YEAR_MS = 365.25 * 86400000;

export interface DashaPeriod {
  planet: string; planetHi: string;
  startDate: string; endDate: string; years: number;
}

export interface VimshottariResult {
  birthNakshatra: string;
  birthNakshatraHi: string;
  moonRashi: string;
  periods: DashaPeriod[];
  currentDasha: DashaPeriod;
  currentAntardasha: string;
  currentAntardashaHi: string;
  dashaBalance: string;
}

export function vimshottari(jdBirth: number, now = new Date()): VimshottariResult {
  const ayan = ayanamsa(jdBirth);
  const moonSid = norm360(moonLongitude(jdBirth) - ayan);
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSid / nakSpan);
  const fracElapsed = (moonSid - nakIdx * nakSpan) / nakSpan;

  const lordIdx = nakIdx % 9; // Ashwini→Ketu, Bharani→Venus, …
  const firstLord = DASHA_ORDER[lordIdx]!;
  const balanceYears = (1 - fracElapsed) * DASHA_YEARS[firstLord]!;

  // Birth moment in ms (jd → unix)
  const birthMs = (jdBirth - 2440587.5) * 86400000;

  const periods: DashaPeriod[] = [];
  let cursor = birthMs;
  for (let k = 0; k < 9; k++) {
    const planet = DASHA_ORDER[(lordIdx + k) % 9]!;
    const years = k === 0 ? balanceYears : DASHA_YEARS[planet]!;
    const start = cursor;
    const end = cursor + years * YEAR_MS;
    periods.push({
      planet, planetHi: PLANET_HI[planet]!,
      startDate: new Date(start).toISOString().split("T")[0]!,
      endDate: new Date(end).toISOString().split("T")[0]!,
      years: Math.round(years * 10) / 10,
    });
    cursor = end;
  }

  const nowMs = now.getTime();
  let current = periods[periods.length - 1]!;
  for (const p of periods) {
    if (nowMs >= Date.parse(p.startDate) && nowMs <= Date.parse(p.endDate) + 86400000) { current = p; break; }
  }

  // Antardasha: sub-periods proportional to each planet's years within the mahadasha
  const mahaStart = Date.parse(current.startDate);
  const mahaLenMs = Date.parse(current.endDate) - mahaStart;
  const mahaLordIdx = DASHA_ORDER.indexOf(current.planet);
  let antarCursor = mahaStart;
  let antar = current.planet;
  for (let k = 0; k < 9; k++) {
    const p = DASHA_ORDER[(mahaLordIdx + k) % 9]!;
    const len = (DASHA_YEARS[p]! / 120) * mahaLenMs;
    if (nowMs >= antarCursor && nowMs < antarCursor + len) { antar = p; break; }
    antarCursor += len;
  }

  const remainingYears = Math.max(0, (Date.parse(current.endDate) - nowMs) / YEAR_MS);

  return {
    birthNakshatra: NAKSHATRAS_EN[nakIdx]!,
    birthNakshatraHi: NAKSHATRAS_HI[nakIdx]!,
    moonRashi: RASHIS_EN[Math.floor(moonSid / 30)]!,
    periods,
    currentDasha: current,
    currentAntardasha: antar,
    currentAntardashaHi: PLANET_HI[antar]!,
    dashaBalance: `${remainingYears.toFixed(1)} years remaining`,
  };
}

// ─── Ashtakavarga (classical BPHS benefic tables) ────────────────────────────
// Benefic house positions counted from [Sun,Moon,Mars,Mercury,Jupiter,Venus,Saturn,Lagna]
// Validated totals: Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39.

const AV_TABLE: Record<string, number[][]> = {
  Sun: [
    [1,2,4,7,8,9,10,11],[3,6,10,11],[1,2,4,7,8,9,10,11],[3,5,6,9,10,11,12],
    [5,6,9,11],[6,7,12],[1,2,4,7,8,9,10,11],[3,4,6,10,11,12],
  ],
  Moon: [
    [3,6,7,8,10,11],[1,3,6,7,10,11],[2,3,5,6,9,10,11],[1,3,4,5,7,8,10,11],
    [1,4,7,8,10,11,12],[3,4,5,7,9,10,11],[3,5,6,11],[3,6,10,11],
  ],
  Mars: [
    [3,5,6,10,11],[3,6,11],[1,2,4,7,8,10,11],[3,5,6,11],
    [6,10,11,12],[6,8,11,12],[1,4,7,8,9,10,11],[1,3,6,10,11],
  ],
  Mercury: [
    [5,6,9,11,12],[2,4,6,8,10,11],[1,2,4,7,8,9,10,11],[1,3,5,6,9,10,11,12],
    [6,8,11,12],[1,2,3,4,5,8,9,11],[1,2,4,7,8,9,10,11],[1,2,4,6,8,10,11],
  ],
  Jupiter: [
    [1,2,3,4,7,8,9,10,11],[2,5,7,9,11],[1,2,4,7,8,10,11],[1,2,4,5,6,9,10,11],
    [1,2,3,4,7,8,10,11],[2,5,6,9,10,11],[3,5,6,12],[1,2,4,5,6,7,9,10,11],
  ],
  Venus: [
    [8,11,12],[1,2,3,4,5,8,9,11,12],[3,4,6,9,11,12],[3,5,6,9,11],
    [5,8,9,10,11],[1,2,3,4,5,8,9,10,11],[3,4,5,8,9,10,11],[1,2,3,4,5,8,9,11],
  ],
  Saturn: [
    [1,2,4,7,8,10,11],[3,6,11],[3,5,6,10,11,12],[6,8,9,10,11,12],
    [5,6,11,12],[6,11,12],[3,5,6,11],[1,3,4,6,10,11],
  ],
};

export interface AshtakavargaResult {
  rows: Array<Record<string, number | string>>;
  sarva: number[];       // per rashi (Aries..Pisces)
  totals: Record<string, number>;
}

const SIGN_KEYS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];

export function ashtakavarga(jdBirth: number, lagnaRashiIdx: number): AshtakavargaResult {
  const pos = grahaPositions(jdBirth);
  const rashiOf: Record<string, number> = {};
  for (const p of pos) rashiOf[p.planet] = p.rashiIndex;

  const refs = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
  const refRashis = [...refs.map((r) => rashiOf[r]!), lagnaRashiIdx]; // + Lagna

  const rows: Array<Record<string, number | string>> = [];
  const sarva = new Array(12).fill(0) as number[];
  const totals: Record<string, number> = {};

  for (const planet of refs) {
    const table = AV_TABLE[planet]!;
    const values = new Array(12).fill(0) as number[];
    table.forEach((beneficHouses, refIdx) => {
      const from = refRashis[refIdx]!;
      for (const h of beneficHouses) {
        values[(from + h - 1) % 12] += 1;
      }
    });
    const total = values.reduce((a, b) => a + b, 0);
    totals[planet] = total;
    const row: Record<string, number | string> = { planet, planetHi: PLANET_HI[planet]! };
    SIGN_KEYS.forEach((k, i) => { row[k] = values[i]!; });
    row["total"] = total;
    rows.push(row);
    values.forEach((v, i) => { sarva[i] += v; });
  }

  return { rows, sarva, totals };
}

// ─── Manglik check ────────────────────────────────────────────────────────────

export function manglikStatus(jdBirth: number, lagnaRashiIdx: number): { manglik: boolean; house: number } {
  const mars = grahaPositions(jdBirth).find((p) => p.planet === "Mars")!;
  const house = ((mars.rashiIndex - lagnaRashiIdx + 12) % 12) + 1;
  return { manglik: [1, 4, 7, 8, 12].includes(house), house };
}

// ─── City geocoding (major Indian cities + fallback) ─────────────────────────

export interface GeoPoint { lat: number; lon: number; matched: string }

const CITIES: Record<string, [number, number]> = {
  delhi: [28.61, 77.21], "new delhi": [28.61, 77.21], mumbai: [19.08, 72.88],
  kolkata: [22.57, 88.36], chennai: [13.08, 80.27], bengaluru: [12.97, 77.59],
  bangalore: [12.97, 77.59], hyderabad: [17.39, 78.49], ahmedabad: [23.02, 72.57],
  pune: [18.52, 73.86], jaipur: [26.91, 75.79], lucknow: [26.85, 80.95],
  kanpur: [26.45, 80.33], nagpur: [21.15, 79.09], indore: [22.72, 75.86],
  bhopal: [23.26, 77.41], patna: [25.59, 85.14], vadodara: [22.31, 73.19],
  surat: [21.17, 72.83], varanasi: [25.32, 82.99], banaras: [25.32, 82.99],
  prayagraj: [25.44, 81.85], allahabad: [25.44, 81.85], agra: [27.18, 78.01],
  meerut: [28.98, 77.71], nashik: [19.99, 73.79], rajkot: [22.3, 70.8],
  amritsar: [31.63, 74.87], ludhiana: [30.9, 75.85], chandigarh: [30.73, 76.78],
  dehradun: [30.32, 78.03], haridwar: [29.95, 78.16], rishikesh: [30.09, 78.27],
  jammu: [32.73, 74.87], srinagar: [34.08, 74.8], shimla: [31.1, 77.17],
  guwahati: [26.14, 91.74], bhubaneswar: [20.3, 85.82], cuttack: [20.46, 85.88],
  ranchi: [23.34, 85.31], jamshedpur: [22.8, 86.18], raipur: [21.25, 81.63],
  gwalior: [26.22, 78.18], jodhpur: [26.24, 73.02], udaipur: [24.58, 73.71],
  kota: [25.21, 75.86], ajmer: [26.45, 74.64], mathura: [27.49, 77.67],
  vrindavan: [27.58, 77.7], ayodhya: [26.8, 82.2], gorakhpur: [26.76, 83.37],
  bareilly: [28.36, 79.42], aligarh: [27.88, 78.08], moradabad: [28.84, 78.78],
  ghaziabad: [28.67, 77.42], noida: [28.57, 77.32], gurugram: [28.46, 77.03],
  gurgaon: [28.46, 77.03], faridabad: [28.41, 77.31], coimbatore: [11.02, 76.96],
  madurai: [9.93, 78.12], tiruchirappalli: [10.79, 78.7], salem: [11.66, 78.15],
  kochi: [9.93, 76.27], thiruvananthapuram: [8.52, 76.94], kozhikode: [11.26, 75.78],
  mysuru: [12.3, 76.64], mysore: [12.3, 76.64], mangaluru: [12.91, 74.86],
  visakhapatnam: [17.69, 83.22], vijayawada: [16.51, 80.65], tirupati: [13.63, 79.42],
  warangal: [17.98, 79.6], aurangabad: [19.88, 75.34], solapur: [17.66, 75.91],
  kolhapur: [16.7, 74.24], goa: [15.49, 73.83], panaji: [15.49, 73.83],
  dhanbad: [23.8, 86.43], asansol: [23.68, 86.98], siliguri: [26.73, 88.4],
  durgapur: [23.55, 87.29], howrah: [22.59, 88.31], jabalpur: [23.18, 79.99],
  ujjain: [23.18, 75.78], haldwani: [29.22, 79.53], jhansi: [25.45, 78.57],
};

export function geocodeCity(place: string | undefined | null): GeoPoint {
  const q = (place || "").toLowerCase().trim();
  if (q) {
    // direct or substring match
    if (CITIES[q]) return { lat: CITIES[q]![0], lon: CITIES[q]![1], matched: q };
    for (const [name, [lat, lon]] of Object.entries(CITIES)) {
      if (q.includes(name) || name.includes(q)) return { lat, lon, matched: name };
    }
  }
  return { lat: 28.61, lon: 77.21, matched: "delhi (default)" }; // Delhi fallback
}
