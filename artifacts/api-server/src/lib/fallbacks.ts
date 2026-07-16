/**
 * Deterministic fallback content for every AI-powered feature.
 * Used automatically (via aiJson) whenever OPENAI_API_KEY is missing
 * or the AI call fails, so the app never returns a 500 for AI features.
 *
 * Hindi ("hi") gets native Devanagari content; every other language
 * falls back to English.
 */

function isHindi(language?: string): boolean {
  const l = (language || "").toLowerCase().trim();
  return l === "hi" || l === "hindi";
}

// ─── Zodiac helpers ───────────────────────────────────────────────────────────

const SIGNS_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const SIGNS_HI = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"];

/** Western sun sign from an ISO date string (YYYY-MM-DD). */
export function sunSignIndex(dob: string): number {
  const d = new Date(dob);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 0;
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 1;
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 2;
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 3;
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 4;
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 5;
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 6;
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 7;
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 8;
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 9;
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 10;
  return 11;
}

function seedFrom(str: string): number {
  return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

const STONES_EN = ["Red Coral","Diamond","Emerald","Pearl","Ruby","Emerald","Diamond","Red Coral","Yellow Sapphire","Blue Sapphire","Blue Sapphire","Yellow Sapphire"];
const STONES_HI = ["मूँगा","हीरा","पन्ना","मोती","माणिक्य","पन्ना","हीरा","मूँगा","पुखराज","नीलम","नीलम","पुखराज"];

// ─── Kundli ───────────────────────────────────────────────────────────────────

export function fallbackKundli(data: {
  name: string; dateOfBirth: string; timeOfBirth: string; placeOfBirth: string; language?: string;
  /** Real computed chart (preferred) — when provided, fallback text uses actual positions */
  real?: { sunRashiIdx: number; moonRashiIdx: number; lagnaIdx: number; manglik: boolean };
}) {
  const seed = seedFrom(data.name + data.dateOfBirth + data.timeOfBirth);
  const si = data.real ? data.real.sunRashiIdx : sunSignIndex(data.dateOfBirth);
  const mi = data.real ? data.real.moonRashiIdx : (si + (seed % 5) + 1) % 12;
  const ai = data.real ? data.real.lagnaIdx : (si + (seed % 7) + 2) % 12;
  const manglik = data.real ? data.real.manglik : seed % 3 === 0;
  const hi = isHindi(data.language);

  if (hi) {
    return {
      sunSign: SIGNS_HI[si]!,
      moonSign: SIGNS_HI[mi]!,
      ascendant: `${SIGNS_HI[ai]} लग्न`,
      analysis: `${data.name} की कुंडली के अनुसार सूर्य ${SIGNS_HI[si]} राशि में स्थित है, जो आत्मविश्वास और नेतृत्व क्षमता प्रदान करता है। चंद्रमा ${SIGNS_HI[mi]} राशि में होने से मन भावुक किंतु दृढ़ है। ${SIGNS_HI[ai]} लग्न होने के कारण करियर में क्रमिक उन्नति, 32-36 वर्ष की आयु में विशेष सफलता के योग हैं। वैवाहिक जीवन सामान्यतः सुखद रहेगा; स्वास्थ्य में पाचन का ध्यान रखें। आर्थिक दृष्टि से मध्य आयु के बाद स्थिरता प्राप्त होगी। यह एक सामान्य विश्लेषण है — विस्तृत AI विश्लेषण के लिए कृपया बाद में पुनः प्रयास करें।`,
      planetaryPositions: `सूर्य: ${SIGNS_HI[si]} | चंद्र: ${SIGNS_HI[mi]} | लग्न: ${SIGNS_HI[ai]} | गुरु, शुक्र एवं बुध शुभ भावों में; शनि कर्म भाव पर दृष्टि डाल रहे हैं।`,
      doshas: manglik
        ? "कुंडली में आंशिक मांगलिक दोष के संकेत हैं। विवाह से पूर्व कुंडली मिलान अवश्य कराएँ। काल सर्प दोष नहीं है।"
        : "कुंडली में कोई प्रमुख दोष (मांगलिक, काल सर्प) दृष्टिगोचर नहीं होता।",
      remedies: "प्रतिदिन प्रातः सूर्य को जल अर्पित करें। सोमवार को शिवजी का अभिषेक करें। मंत्र: ॐ नमः शिवाय (108 बार)। गुरुवार को पीली वस्तु का दान करें।",
      manglikStatus: manglik ? "आंशिक मांगलिक" : "गैर-मांगलिक",
      luckyStone: STONES_HI[si]!,
    };
  }
  return {
    sunSign: SIGNS_EN[si]!,
    moonSign: SIGNS_EN[mi]!,
    ascendant: `${SIGNS_EN[ai]} Ascendant`,
    analysis: `According to ${data.name}'s birth chart, the Sun is placed in ${SIGNS_EN[si]}, giving confidence and leadership ability. The Moon in ${SIGNS_EN[mi]} makes the mind emotional yet determined. With ${SIGNS_EN[ai]} rising, career growth is steady with notable success between ages 32-36. Married life is generally harmonious; pay attention to digestion for health. Financial stability strengthens after middle age. This is a general reading — please try again later for a detailed AI analysis.`,
    planetaryPositions: `Sun: ${SIGNS_EN[si]} | Moon: ${SIGNS_EN[mi]} | Ascendant: ${SIGNS_EN[ai]} | Jupiter, Venus and Mercury in benefic houses; Saturn aspects the house of karma.`,
    doshas: manglik
      ? "Indications of partial Manglik dosha are present. Kundli matching before marriage is advised. No Kaal Sarpa dosha."
      : "No major doshas (Manglik, Kaal Sarpa) are visible in the chart.",
    remedies: "Offer water to the Sun every morning. Perform Shiva abhishek on Mondays. Mantra: ॐ नमः शिवाय (108 times). Donate yellow items on Thursdays.",
    manglikStatus: manglik ? "Partial Manglik" : "Non-Manglik",
    luckyStone: STONES_EN[si]!,
  };
}

// ─── Problem Solver ───────────────────────────────────────────────────────────

export function fallbackProblems(category: string, language?: string) {
  const hi = isHindi(language);
  const CAT_HI: Record<string, string> = {
    career: "करियर", marriage: "विवाह", health: "स्वास्थ्य", finance: "धन",
    education: "शिक्षा", family: "परिवार", love: "प्रेम", business: "व्यापार",
  };
  if (hi) {
    const cat = CAT_HI[category?.toLowerCase()] || "जीवन";
    return {
      remedies: `${cat} संबंधी समस्या के समाधान हेतु नियमित पूजा-पाठ, सकारात्मक दिनचर्या और नीचे दिए गए उपाय करें। धैर्य के साथ 40 दिन तक उपाय करने से लाभ मिलता है।`,
      lalKitabRemedy: "शनिवार को काले चने और सरसों का तेल दान करें। बहते जल में तांबे का सिक्का प्रवाहित करें। घर के मुख्य द्वार पर स्वच्छता रखें।",
      atharvavedaRemedy: "प्रातः स्नान के बाद गायत्री मंत्र का 11 बार जप करें और सूर्य को जल अर्पित करें।",
      yogPradeepamRemedy: "प्रतिदिन 15 मिनट अनुलोम-विलोम एवं 10 मिनट ध्यान करें। सूर्य नमस्कार के 5 चक्र करें।",
      vastuRemedy: "उत्तर-पूर्व दिशा स्वच्छ रखें। मुख्य द्वार पर स्वस्तिक बनाएँ। ईशान कोण में जल-पात्र रखें।",
      mantra: "ॐ गं गणपतये नमः (प्रतिदिन 108 बार)",
      gemstone: "पुखराज — गुरुवार को स्वर्ण में तर्जनी उंगली में धारण करें (किसी योग्य ज्योतिषी से परामर्श के बाद)।",
    };
  }
  return {
    remedies: `For your ${category} concern, follow a regular spiritual routine along with the specific remedies below. Practicing consistently for 40 days brings noticeable results.`,
    lalKitabRemedy: "On Saturdays, donate black gram and mustard oil. Float a copper coin in flowing water. Keep the main entrance of your home clean.",
    atharvavedaRemedy: "After your morning bath, chant the Gayatri Mantra 11 times and offer water to the Sun.",
    yogPradeepamRemedy: "Practice 15 minutes of Anulom-Vilom and 10 minutes of meditation daily. Do 5 rounds of Surya Namaskar.",
    vastuRemedy: "Keep the north-east direction clean. Draw a Swastik at the main entrance. Place a water vessel in the Ishaan (NE) corner.",
    mantra: "ॐ गं गणपतये नमः (108 times daily)",
    gemstone: "Yellow Sapphire — wear in gold on the index finger on a Thursday (after consulting a qualified astrologer).",
  };
}

// ─── Numerology ───────────────────────────────────────────────────────────────

export function fallbackNumerology(fullName: string, dateOfBirth: string, lifePath: number, destiny: number, language?: string) {
  const hi = isHindi(language);
  const day = new Date(dateOfBirth).getDate();
  const birthday = day > 9 ? (day % 9 === 0 ? 9 : day % 9) : day;
  const soul = ((lifePath + destiny) % 9) || 9;
  const personality = ((destiny + birthday) % 9) || 9;
  const year = new Date().getFullYear();
  const lucky = [year + (lifePath % 3) + 1, year + (lifePath % 5) + 3];
  const compat = [((lifePath % 9) || 9), (((lifePath + 3) % 9) || 9), (((lifePath + 6) % 9) || 9)].join(", ");

  if (hi) {
    return {
      soulUrgeNumber: soul, personalityNumber: personality, birthdayNumber: birthday,
      analysis: `${fullName} का मूलांक (Life Path) ${lifePath} है, जो आत्मनिर्भरता और दृढ़ संकल्प का प्रतीक है। भाग्यांक ${destiny} दर्शाता है कि परिश्रम से बड़ी उपलब्धियाँ संभव हैं। जन्मांक ${birthday} रचनात्मकता प्रदान करता है। आपकी संख्याएँ नेतृत्व, व्यावहारिक बुद्धि और भावनात्मक गहराई का संतुलन दिखाती हैं।`,
      strengths: "दृढ़ इच्छाशक्ति, नेतृत्व क्षमता, रचनात्मक सोच और कठिन परिस्थितियों में धैर्य।",
      challenges: "कभी-कभी अति-विचार और ज़िद; निर्णय में लचीलापन लाना लाभकारी रहेगा।",
      luckyYears: `${lucky[0]} और ${lucky[1]} विशेष रूप से शुभ रहेंगे — करियर और आर्थिक उन्नति के प्रबल योग।`,
      compatibleNumbers: `मूलांक ${compat} वाले व्यक्तियों के साथ अच्छा तालमेल रहेगा।`,
    };
  }
  return {
    soulUrgeNumber: soul, personalityNumber: personality, birthdayNumber: birthday,
    analysis: `${fullName}'s Life Path number is ${lifePath}, symbolising self-reliance and strong determination. The Destiny number ${destiny} shows that great achievements come through consistent effort. The Birthday number ${birthday} adds creativity. Together, your numbers balance leadership, practical intelligence and emotional depth.`,
    strengths: "Strong willpower, leadership ability, creative thinking, and patience under pressure.",
    challenges: "Occasional over-thinking and stubbornness; flexibility in decisions will help.",
    luckyYears: `${lucky[0]} and ${lucky[1]} look especially favourable — strong prospects for career and financial growth.`,
    compatibleNumbers: `You share natural harmony with Life Path numbers ${compat}.`,
  };
}

// ─── Yoga ─────────────────────────────────────────────────────────────────────

export function fallbackYoga(healthGoals: string, fitnessLevel: string, duration: number, language?: string) {
  const hi = isHindi(language);
  if (hi) {
    return {
      morningRoutine: `(${duration} मिनट) सूर्य नमस्कार × 5, ताड़ासन, वृक्षासन, भुजंगासन, अधोमुख श्वानासन — प्रत्येक 5-8 श्वास तक। अंत में 2 मिनट शवासन।`,
      eveningRoutine: "बालासन, पश्चिमोत्तानासन, सुप्त बद्धकोणासन और विपरीत करणी — प्रत्येक 1-2 मिनट। धीमी गहरी श्वास के साथ शरीर को शिथिल करें।",
      meditation: `${healthGoals} के लक्ष्य हेतु 10 मिनट श्वास-केंद्रित ध्यान करें — आँखें बंद कर नासिका से आती-जाती श्वास पर ध्यान टिकाएँ।`,
      breathingExercises: "अनुलोम-विलोम 5 मिनट, भ्रामरी 5 बार, कपालभाति 3 चक्र (30 स्ट्रोक) — खाली पेट करें।",
      dietaryAdvice: "सात्विक आहार लें — ताज़े फल, सब्ज़ियाँ, अंकुरित अनाज। भोजन के समय नियमित रखें। रात का भोजन हल्का और सोने से 3 घंटे पहले।",
      weeklySchedule: `सोम-शुक्र: प्रातः दिनचर्या (${duration} मिनट)। मंगल/गुरु: सायं स्ट्रेचिंग। शनि: लंबा अभ्यास + प्राणायाम। रवि: विश्राम एवं हल्की सैर। (स्तर: ${fitnessLevel})`,
    };
  }
  return {
    morningRoutine: `(${duration} min) Surya Namaskar × 5, Tadasana, Vrikshasana, Bhujangasana, Adho Mukha Svanasana — hold each for 5-8 breaths. Finish with 2 minutes of Shavasana.`,
    eveningRoutine: "Balasana, Paschimottanasana, Supta Baddha Konasana and Viparita Karani — 1-2 minutes each, relaxing with slow deep breaths.",
    meditation: `For your goal of ${healthGoals}, practice 10 minutes of breath-focused meditation — eyes closed, attention resting on the breath at the nostrils.`,
    breathingExercises: "Anulom-Vilom 5 minutes, Bhramari 5 rounds, Kapalbhati 3 rounds of 30 strokes — on an empty stomach.",
    dietaryAdvice: "Follow a sattvic diet — fresh fruits, vegetables, sprouted grains. Keep meal times regular. Keep dinner light, at least 3 hours before sleep.",
    weeklySchedule: `Mon-Fri: morning routine (${duration} min). Tue/Thu: evening stretching. Sat: longer practice + pranayama. Sun: rest and light walking. (Level: ${fitnessLevel})`,
  };
}

// ─── Kundli Milan ─────────────────────────────────────────────────────────────

export function fallbackMilan(p1: string, p2: string, dob1: string, dob2: string, language?: string) {
  const hi = isHindi(language);
  const seed = seedFrom(p1 + p2 + dob1 + dob2);
  const varna = seed % 2, vashya = seed % 3, tara = (seed % 3) + 1, yoni = (seed % 4) + 1;
  const griha = (seed % 4) + 2, gana = seed % 2 === 0 ? 6 : 3, bhakoota = seed % 3 === 0 ? 0 : 7, nadi = seed % 4 === 0 ? 0 : 8;
  const total = varna + vashya + tara + yoni + griha + gana + bhakoota + nadi;
  const compEn = total >= 30 ? "Excellent" : total >= 24 ? "Good" : total >= 18 ? "Average" : "Below Average";
  const compHi = total >= 30 ? "उत्तम" : total >= 24 ? "अच्छा" : total >= 18 ? "सामान्य" : "औसत से कम";

  if (hi) {
    return {
      totalScore: total, maxScore: 36, compatibility: compHi,
      varna, vashya, tara, yoni, grihaMaitri: griha, gana, bhakoota, nadi,
      analysis: `${p1} और ${p2} की कुंडलियों के अष्टकूट मिलान में कुल ${total}/36 गुण प्राप्त हुए, जो ${compHi} श्रेणी में आता है। ${nadi === 8 ? "नाड़ी मिलान अनुकूल है, जो स्वास्थ्य और संतान सुख के लिए शुभ है।" : "नाड़ी दोष के संकेत हैं, जिसके लिए उपाय कराना उचित रहेगा।"} ${gana === 6 ? "गण मिलान उत्तम है — स्वभाव में सामंजस्य रहेगा।" : "गण में आंशिक अंतर है — परस्पर समझ से संतुलन संभव है।"}`,
      strengths: "भावनात्मक समझ, पारिवारिक मूल्यों में समानता, और एक-दूसरे के करियर को सहयोग देने की प्रवृत्ति।",
      challenges: "आरंभिक वर्षों में संवाद की कमी से मतभेद संभव — खुलकर बातचीत और धैर्य से समाधान होगा।",
      recommendation: total >= 24
        ? "यह विवाह के लिए अनुकूल मिलान है। शुभ मुहूर्त में विवाह संपन्न करें।"
        : "मिलान सामान्य है। विवाह से पूर्व किसी योग्य ज्योतिषी से दोष-निवारण उपाय अवश्य कराएँ।",
    };
  }
  return {
    totalScore: total, maxScore: 36, compatibility: compEn,
    varna, vashya, tara, yoni, grihaMaitri: griha, gana, bhakoota, nadi,
    analysis: `The Ashtakoot matching of ${p1} and ${p2} scores ${total}/36 gunas, which falls in the ${compEn} category. ${nadi === 8 ? "Nadi matching is favourable — auspicious for health and progeny." : "There are indications of Nadi dosha, for which remedies are advisable."} ${gana === 6 ? "Gana matching is excellent — temperaments will be harmonious." : "There is partial difference in Gana — balance is achievable through mutual understanding."}`,
    strengths: "Emotional understanding, similar family values, and a natural tendency to support each other's careers.",
    challenges: "Communication gaps may cause differences in the early years — open conversation and patience resolve them.",
    recommendation: total >= 24
      ? "This is a favourable match for marriage. Proceed at an auspicious muhurat."
      : "The match is average. Consult a qualified astrologer for dosha-remedies before marriage.",
  };
}

// ─── Vastu / Palm / Face (image analysis) ─────────────────────────────────────

export function fallbackVastu(roomType: string, language?: string) {
  const hi = isHindi(language);
  if (hi) {
    return {
      overallScore: 68,
      findings: `${roomType} का सामान्य वास्तु मूल्यांकन: कक्ष की ऊर्जा संतुलित प्रतीत होती है, किंतु दिशाओं के अनुसार कुछ सुधार लाभकारी होंगे। (छवि का AI विश्लेषण अभी उपलब्ध नहीं — यह सामान्य मार्गदर्शन है।)`,
      positiveAspects: "प्राकृतिक प्रकाश और वायु-संचार की संभावना अच्छी है। स्वच्छता बनाए रखने से सकारात्मक ऊर्जा बढ़ेगी।",
      remedies: "ईशान कोण स्वच्छ व हल्का रखें, भारी सामान दक्षिण-पश्चिम में रखें, मुख्य द्वार पर स्वस्तिक/तोरण लगाएँ।",
      colorRecommendations: "उत्तर: हरा/हल्का नीला | पूर्व: सफ़ेद/हल्का पीला | दक्षिण: हल्का लाल/गुलाबी | पश्चिम: क्रीम/हल्का भूरा",
      directionAnalysis: "उत्तर-पूर्व (ईशान): जल/पूजा हेतु उत्तम | दक्षिण-पश्चिम: भारी फर्नीचर/शयन | दक्षिण-पूर्व (आग्नेय): रसोई/विद्युत उपकरण | उत्तर-पश्चिम: अतिथि कक्ष/भंडारण",
      doshas: [
        { name: "सामान्य ऊर्जा असंतुलन", severity: "low", description: "कक्ष में वस्तुओं की व्यवस्था से ऊर्जा-प्रवाह आंशिक रूप से बाधित हो सकता है।", upaay: "अनावश्यक वस्तुएँ हटाएँ, ईशान कोण खाली व स्वच्छ रखें, प्रतिदिन खिड़कियाँ खोलें।" },
        { name: "दिशा-दोष की संभावना", severity: "medium", description: "फ़र्नीचर की दिशा वास्तु के अनुरूप न होने पर मानसिक अशांति संभव है।", upaay: "बिस्तर/कार्य-मेज़ इस प्रकार रखें कि सिर दक्षिण या पूर्व की ओर रहे; दर्पण उत्तर/पूर्व दीवार पर लगाएँ।" },
      ],
    };
  }
  return {
    overallScore: 68,
    findings: `General Vastu assessment of the ${roomType}: the room's energy appears balanced, though a few directional corrections will help. (AI image analysis is currently unavailable — this is general guidance.)`,
    positiveAspects: "Good potential for natural light and ventilation. Keeping the space clean will amplify positive energy.",
    remedies: "Keep the north-east corner clean and light, place heavy items in the south-west, and put a Swastik/toran at the main entrance.",
    colorRecommendations: "North: green/light blue | East: white/light yellow | South: light red/pink | West: cream/light brown",
    directionAnalysis: "North-East (Ishaan): best for water/prayer | South-West: heavy furniture/sleeping | South-East (Agneya): kitchen/electricals | North-West: guest room/storage",
    doshas: [
      { name: "General energy imbalance", severity: "low", description: "The arrangement of items may partially obstruct energy flow in the room.", upaay: "Declutter, keep the north-east corner empty and clean, and open windows daily." },
      { name: "Possible directional dosha", severity: "medium", description: "Furniture not aligned with Vastu directions can cause mental restlessness.", upaay: "Position the bed/work-desk so the head faces south or east; place mirrors on the north/east wall." },
    ],
  };
}

export function fallbackPalm(language?: string) {
  const hi = isHindi(language);
  if (hi) {
    return {
      lifeLine: "जीवन रेखा गहरी और स्पष्ट प्रतीत होती है — उत्तम जीवन-शक्ति और रोग-प्रतिरोधक क्षमता का संकेत।",
      heartLine: "हृदय रेखा संतुलित है — भावनात्मक स्थिरता और गहरे संबंधों की क्षमता दर्शाती है।",
      headLine: "मस्तिष्क रेखा लंबी और सुस्पष्ट है — तीव्र बुद्धि, विश्लेषण-क्षमता और व्यावहारिक निर्णय का संकेत।",
      fateLine: "भाग्य रेखा मध्यम स्पष्टता की है — परिश्रम से भाग्य निर्माण का योग।",
      sunLine: "सूर्य रेखा उपस्थित है — यश और रचनात्मक सफलता का संकेत।",
      analysis: "हस्तरेखा का सामान्य विश्लेषण: आपकी हथेली दृढ़ संकल्प, व्यावहारिक बुद्धि और भावनात्मक संतुलन दर्शाती है। 30 के बाद करियर में स्थिरता और उन्नति के प्रबल योग हैं। (छवि का AI विश्लेषण अभी उपलब्ध नहीं — यह सामान्य पठन है।)",
      longevityPrediction: "दीर्घायु के शुभ संकेत — नियमित दिनचर्या और संतुलित आहार से स्वास्थ्य उत्तम रहेगा।",
      careerPrediction: "स्व-प्रयासों से उन्नति; 32-40 की आयु में विशेष सफलता और नेतृत्व के अवसर।",
      lovePrediction: "प्रेम/वैवाहिक जीवन में स्थिरता; जीवनसाथी सहयोगी और समझदार मिलने के योग।",
      fortunePrediction: "मध्य आयु के बाद भाग्य प्रबल — धन-संचय और सामाजिक प्रतिष्ठा में वृद्धि।",
    };
  }
  return {
    lifeLine: "The life line appears deep and clear — a sign of excellent vitality and immunity.",
    heartLine: "The heart line is balanced — indicating emotional stability and capacity for deep relationships.",
    headLine: "The head line is long and well-defined — sharp intellect, analytical ability and practical judgement.",
    fateLine: "The fate line shows medium clarity — fortune built through steady effort.",
    sunLine: "A sun line is present — indicating fame and creative success.",
    analysis: "General palm reading: your palm reflects determination, practical intelligence and emotional balance. Strong prospects of career stability and growth after age 30. (AI image analysis is currently unavailable — this is a general reading.)",
    longevityPrediction: "Favourable signs of longevity — regular routine and balanced diet will keep health excellent.",
    careerPrediction: "Progress through self-effort; notable success and leadership opportunities between ages 32-40.",
    lovePrediction: "Stability in love/married life; a supportive and understanding partner is indicated.",
    fortunePrediction: "Fortune strengthens after middle age — growth in wealth and social standing.",
  };
}

export function fallbackFace(language?: string) {
  const hi = isHindi(language);
  if (hi) {
    return {
      faceShape: "अंडाकार",
      eyeAnalysis: "नेत्र तेजस्वी और अभिव्यक्तिपूर्ण — बुद्धिमत्ता और संवेदनशीलता का संकेत।",
      noseAnalysis: "नासिका सुडौल — आत्मसम्मान और आर्थिक समृद्धि का प्रतीक।",
      lipsAnalysis: "होंठ संतुलित — मधुर वाणी और कूटनीतिक क्षमता दर्शाते हैं।",
      foreheadAnalysis: "ललाट चौड़ा — दूरदर्शिता, विद्या और नेतृत्व-क्षमता का संकेत।",
      analysis: "सामुद्रिक शास्त्र के अनुसार सामान्य विश्लेषण: मुख-मंडल आत्मविश्वास, बुद्धि और सौभाग्य के लक्षण दर्शाता है। सामाजिक जीवन में सम्मान और मध्य आयु में विशेष उन्नति के योग हैं। (छवि का AI विश्लेषण अभी उपलब्ध नहीं — यह सामान्य पठन है।)",
      personalityTraits: "आत्मविश्वासी, विचारशील, रचनात्मक और परिवार के प्रति समर्पित।",
      fortunePrediction: "35 के बाद भाग्योदय के प्रबल संकेत — करियर और सामाजिक प्रतिष्ठा में वृद्धि।",
      healthIndicators: "समग्र स्वास्थ्य अच्छा; तनाव-प्रबंधन और पर्याप्त निद्रा का ध्यान रखें।",
    };
  }
  return {
    faceShape: "Oval",
    eyeAnalysis: "Bright, expressive eyes — a sign of intelligence and sensitivity.",
    noseAnalysis: "A well-proportioned nose — symbolising self-respect and financial prosperity.",
    lipsAnalysis: "Balanced lips — indicating pleasant speech and diplomatic ability.",
    foreheadAnalysis: "A broad forehead — a sign of foresight, learning and leadership.",
    analysis: "General reading per Samudrika Shastra: the face shows marks of confidence, intellect and good fortune. Respect in social life and notable progress in middle age are indicated. (AI image analysis is currently unavailable — this is a general reading.)",
    personalityTraits: "Confident, thoughtful, creative and devoted to family.",
    fortunePrediction: "Strong signs of fortune rising after 35 — growth in career and social standing.",
    healthIndicators: "Overall health is good; take care of stress management and adequate sleep.",
  };
}

// ─── Dasha / Gochar / Ashtakavarga / Muhurat ─────────────────────────────────

const PLANET_EFFECTS_EN: Record<string, string> = {
  Ketu: "A period of detachment and spiritual growth; avoid impulsive decisions.",
  Venus: "Favourable for love, luxury, arts and financial comfort.",
  Sun: "Authority and recognition rise; watch out for ego conflicts.",
  Moon: "Emotions and intuition dominate; good for home and family matters.",
  Mars: "High energy and courage; channel it into action, avoid disputes.",
  Rahu: "Sudden opportunities and ambitions; stay grounded and ethical.",
  Jupiter: "Wisdom, expansion and good fortune; excellent for education and finances.",
  Saturn: "Discipline and hard work bring lasting rewards; patience is key.",
  Mercury: "Sharp intellect and communication; great for business and learning.",
};
const PLANET_EFFECTS_HI: Record<string, string> = {
  Ketu: "वैराग्य और आध्यात्मिक उन्नति का समय; आवेगपूर्ण निर्णयों से बचें।",
  Venus: "प्रेम, वैभव, कला और आर्थिक सुख के लिए अनुकूल।",
  Sun: "मान-सम्मान और अधिकार में वृद्धि; अहंकार के टकराव से बचें।",
  Moon: "भावनाएँ और अंतर्ज्ञान प्रबल; घर-परिवार के कार्यों हेतु शुभ।",
  Mars: "ऊर्जा और साहस चरम पर; इसे कर्म में लगाएँ, विवाद से बचें।",
  Rahu: "अचानक अवसर और महत्वाकांक्षाएँ; संयम और नैतिकता बनाए रखें।",
  Jupiter: "ज्ञान, विस्तार और सौभाग्य; शिक्षा व धन के लिए उत्तम।",
  Saturn: "अनुशासन और परिश्रम से स्थायी फल; धैर्य आवश्यक है।",
  Mercury: "तीव्र बुद्धि और संवाद-कौशल; व्यापार व अध्ययन हेतु श्रेष्ठ।",
};

export function fallbackDasha(currentDasha: string, currentAntar: string, language?: string) {
  const hi = isHindi(language);
  const effects = hi ? PLANET_EFFECTS_HI : PLANET_EFFECTS_EN;
  const interp = hi
    ? `वर्तमान में ${currentDasha} महादशा के अंतर्गत ${currentAntar} अंतर्दशा चल रही है। ${effects[currentDasha] || ""} इस अवधि में ${effects[currentAntar]?.toLowerCase() || "संतुलित प्रयास शुभ फल देंगे।"} नियमित साधना और धैर्य से यह काल अनुकूल परिणाम देगा।`
    : `You are currently in the ${currentDasha} Mahadasha with ${currentAntar} Antardasha. ${effects[currentDasha] || ""} During this sub-period, ${effects[currentAntar]?.toLowerCase() || "balanced efforts bring good results."} Regular spiritual practice and patience will make this period favourable.`;
  return { currentPeriodInterpretation: interp, periodEffects: effects };
}

export function fallbackGochar(language?: string) {
  const hi = isHindi(language);
  return {
    effects: hi ? PLANET_EFFECTS_HI : PLANET_EFFECTS_EN,
    generalEffect: hi
      ? "आज ग्रहों की स्थिति मिश्रित फल देने वाली है। महत्वपूर्ण कार्य दोपहर से पूर्व निपटाएँ, वाणी में संयम रखें और सायंकाल ध्यान/पूजा हेतु शुभ है।"
      : "Today's planetary positions bring mixed results. Complete important tasks before noon, stay measured in speech, and the evening is auspicious for meditation or prayer.",
  };
}

export function fallbackAshtakavarga(strongHouses: string[], weakHouses: string[], language?: string) {
  const hi = isHindi(language);
  const HI_MAP: Record<string, string> = {
    Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या",
    Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुम्भ", Pisces: "मीन",
  };
  if (hi) {
    const strong = strongHouses.map(s => HI_MAP[s] || s).join(", ") || "कोई नहीं";
    const weak = weakHouses.map(s => HI_MAP[s] || s).join(", ") || "कोई नहीं";
    return {
      strongHouses: strong,
      weakHouses: weak,
      analysis: `अष्टकवर्ग विश्लेषण के अनुसार ${strong !== "कोई नहीं" ? `${strong} राशियों में बिंदु-बल अधिक है — इन क्षेत्रों से जुड़े कार्यों में सफलता सहज मिलेगी।` : "अधिकांश राशियों में बिंदु-बल संतुलित है।"} ${weak !== "कोई नहीं" ? `${weak} राशियों में बल न्यून है — इनसे संबंधित निर्णयों में सतर्कता रखें।` : ""} कुल मिलाकर कुंडली में कर्म-प्रधानता है; निरंतर प्रयास से भाग्य प्रबल होगा। शुभ ग्रहों की दशा में महत्वपूर्ण कार्य आरंभ करें।`,
    };
  }
  return {
    strongHouses: strongHouses.join(", ") || "None",
    weakHouses: weakHouses.join(", ") || "None",
    analysis: `Per the Ashtakavarga analysis, ${strongHouses.length ? `${strongHouses.join(", ")} carry higher bindus — success comes naturally in matters connected to these signs.` : "the bindu strength is fairly balanced across signs."} ${weakHouses.length ? `${weakHouses.join(", ")} show lower strength — exercise caution in decisions related to them.` : ""} Overall, the chart favours effort-driven destiny; consistent action strengthens fortune. Initiate important work during benefic planetary periods.`,
  };
}

export function fallbackMuhurat(purposeLabel: string, startDate: string, endDate: string, language?: string) {
  const hi = isHindi(language);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const spanDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  const picks = [0.15, 0.45, 0.75].map(f => {
    const d = new Date(start.getTime() + Math.floor(spanDays * f) * 86400000);
    return d.toISOString().split("T")[0]!;
  });
  const TITHIS_EN = ["Dwitiya", "Panchami", "Dashami"];
  const TITHIS_HI = ["द्वितीया", "पंचमी", "दशमी"];
  const NAKS_EN = ["Rohini", "Pushya", "Anuradha"];
  const NAKS_HI = ["रोहिणी", "पुष्य", "अनुराधा"];
  const YOGAS_EN = ["Siddhi", "Shubha", "Amrita"];
  const YOGAS_HI = ["सिद्धि", "शुभ", "अमृत"];
  const TIMES = ["09:15 AM - 11:30 AM", "10:45 AM - 12:50 PM", "05:30 PM - 07:15 PM"];
  const QUAL = ["excellent", "good", "good"];

  const muhurats = picks.map((date, i) => ({
    date,
    timeRange: TIMES[i]!,
    tithi: hi ? TITHIS_HI[i]! : TITHIS_EN[i]!,
    nakshatra: hi ? NAKS_HI[i]! : NAKS_EN[i]!,
    yoga: hi ? YOGAS_HI[i]! : YOGAS_EN[i]!,
    quality: QUAL[i]!,
    reason: hi
      ? `${purposeLabel} हेतु यह अवधि शुभ है — चंद्रमा अनुकूल नक्षत्र में है और कोई प्रमुख अशुभ योग नहीं है।`
      : `This window is auspicious for ${purposeLabel} — the Moon transits a favourable nakshatra with no major inauspicious yoga.`,
  }));

  return {
    muhurats,
    generalGuidance: hi
      ? `${purposeLabel} के लिए राहुकाल से बचें, कार्य आरंभ से पूर्व गणेश-पूजन करें और स्थानीय पंचांग से समय की पुष्टि अवश्य करें। (यह सामान्य मार्गदर्शन है — सटीक मुहूर्त हेतु स्थानीय पंडित से परामर्श करें।)`
      : `For ${purposeLabel}, avoid Rahu Kaal, begin with a Ganesh puja, and confirm timings against your local panchang. (This is general guidance — consult a local pandit for precise muhurat.)`,
  };
}
