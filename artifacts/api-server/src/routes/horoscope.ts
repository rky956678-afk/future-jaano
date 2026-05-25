import { Router } from "express";

const router = Router();

const ZODIAC_SIGNS: Record<
  string,
  { hindi: string; emoji: string; compatible: string; compatibleHi: string; gem: string; gemHi: string }
> = {
  aries:       { hindi: "मेष",      emoji: "♈", compatible: "Leo",         compatibleHi: "सिंह",     gem: "Red Coral",       gemHi: "मूँगा" },
  taurus:      { hindi: "वृषभ",     emoji: "♉", compatible: "Virgo",       compatibleHi: "कन्या",    gem: "Diamond",         gemHi: "हीरा" },
  gemini:      { hindi: "मिथुन",    emoji: "♊", compatible: "Libra",       compatibleHi: "तुला",     gem: "Emerald",         gemHi: "पन्ना" },
  cancer:      { hindi: "कर्क",     emoji: "♋", compatible: "Scorpio",     compatibleHi: "वृश्चिक",  gem: "Pearl",           gemHi: "मोती" },
  leo:         { hindi: "सिंह",     emoji: "♌", compatible: "Aries",       compatibleHi: "मेष",      gem: "Ruby",            gemHi: "माणिक्य" },
  virgo:       { hindi: "कन्या",    emoji: "♍", compatible: "Taurus",      compatibleHi: "वृषभ",     gem: "Emerald",         gemHi: "पन्ना" },
  libra:       { hindi: "तुला",     emoji: "♎", compatible: "Gemini",      compatibleHi: "मिथुन",    gem: "Diamond",         gemHi: "हीरा" },
  scorpio:     { hindi: "वृश्चिक",  emoji: "♏", compatible: "Cancer",      compatibleHi: "कर्क",     gem: "Red Coral",       gemHi: "मूँगा" },
  sagittarius: { hindi: "धनु",      emoji: "♐", compatible: "Aries",       compatibleHi: "मेष",      gem: "Yellow Sapphire", gemHi: "पुखराज" },
  capricorn:   { hindi: "मकर",      emoji: "♑", compatible: "Taurus",      compatibleHi: "वृषभ",     gem: "Blue Sapphire",   gemHi: "नीलम" },
  aquarius:    { hindi: "कुम्भ",    emoji: "♒", compatible: "Libra",       compatibleHi: "तुला",     gem: "Blue Sapphire",   gemHi: "नीलम" },
  pisces:      { hindi: "मीन",      emoji: "♓", compatible: "Cancer",      compatibleHi: "कर्क",     gem: "Yellow Sapphire", gemHi: "पुखराज" },
};

interface PredictionFields {
  prediction: string;
  health: string;
  career: string;
  love: string;
  finance: string;
}

const PREDICTIONS_EN: Record<string, PredictionFields> = {
  aries: {
    prediction: "Planetary alignment favors bold decisions today. Your leadership qualities shine bright.",
    health: "Energy levels are high. Channel this through physical exercise and meditation.",
    career: "A new project or opportunity may come your way. Trust your instincts.",
    love: "Mars brings passion into relationships. Express your feelings openly.",
    finance: "Jupiter's influence brings financial gains. Avoid impulsive spending.",
  },
  taurus: {
    prediction: "Venus blesses you with stability and harmony today. Focus on long-term goals.",
    health: "Take care of your throat and neck. Adequate hydration is important today.",
    career: "Your practical skills will be recognized. A promotion or raise may be near.",
    love: "Deep connections strengthen today. Spend quality time with loved ones.",
    finance: "A good day to invest or save. Avoid luxury purchases.",
  },
  gemini: {
    prediction: "Mercury energizes your mind today. Communication and networking open new doors.",
    health: "Your nervous system needs rest. Avoid overthinking and practice mindfulness.",
    career: "Your ideas will be well-received. A great day for presentations and meetings.",
    love: "Witty conversation draws people closer. Be open to new connections.",
    finance: "Multiple income streams may appear. Stay organized with finances.",
  },
  cancer: {
    prediction: "The Moon heightens your intuition. Trust your inner voice for important decisions.",
    health: "Emotional wellbeing needs attention. Journaling or meditation will help.",
    career: "Your nurturing skills help in team situations. Leadership comes naturally.",
    love: "Home and family bring joy. Plan a special evening with close ones.",
    finance: "Savings plans made now will bear fruit. Be conservative with spending.",
  },
  leo: {
    prediction: "The Sun illuminates your path today. Your charisma attracts success and admiration.",
    health: "Heart health is important. Light cardio and a balanced diet are recommended.",
    career: "Your creative ideas stand out. This is your moment to lead and inspire.",
    love: "Romantic energy is high. Plan something special for your partner.",
    finance: "Speculative investments look favorable. Consult an expert before acting.",
  },
  virgo: {
    prediction: "Mercury sharpens your analytical mind today. Details matter — pay attention.",
    health: "Digestive health needs care. Eat clean and avoid processed foods.",
    career: "Your meticulous approach impresses superiors. Recognition is on its way.",
    love: "Acts of service strengthen your relationships. Show love through thoughtful gestures.",
    finance: "A methodical approach to finances pays off. Review your budget today.",
  },
  libra: {
    prediction: "Venus brings beauty and balance into your life today. Harmony prevails in all areas.",
    health: "Kidney and lower back need attention. Stay hydrated and stretch regularly.",
    career: "Partnerships and collaborations thrive. Diplomatic skills resolve conflicts.",
    love: "Romance is in the air. Plan a meaningful gesture for your partner.",
    finance: "Balance your accounts and avoid debt. A moderate approach brings stability.",
  },
  scorpio: {
    prediction: "Pluto deepens your perceptions. Transformation and renewal are your themes today.",
    health: "Reproductive and immune health need attention. Rest and proper nutrition help.",
    career: "Your investigative skills uncover hidden opportunities. Trust your research.",
    love: "Intense emotional bonds form or deepen today. Vulnerability is strength.",
    finance: "Shared resources or inheritance matters may surface. Handle with care.",
  },
  sagittarius: {
    prediction: "Jupiter expands your horizons today. Travel, learning, and growth are favored.",
    health: "Hip and thigh areas need stretching. Outdoor activities bring vitality.",
    career: "Higher education or international connections bring career breakthroughs.",
    love: "Adventure and freedom in relationships attract the right people.",
    finance: "Long-term investments look promising. Avoid gambling or speculation.",
  },
  capricorn: {
    prediction: "Saturn rewards your discipline today. Hard work translates directly into results.",
    health: "Bone and joint health matters. Regular exercise and calcium-rich foods help.",
    career: "Authority figures recognize your efforts. Promotions or new responsibilities await.",
    love: "Stability and commitment are your relationship strengths today.",
    finance: "Conservative financial strategies protect your wealth. Invest wisely.",
  },
  aquarius: {
    prediction: "Uranus sparks innovation today. Your unique perspective attracts positive attention.",
    health: "Circulatory system needs attention. Light aerobic exercise is beneficial.",
    career: "Technology and innovation projects thrive under your leadership.",
    love: "Friendship forms the foundation of lasting romance. Connect on a mental level.",
    finance: "Unconventional investment ideas may prove surprisingly lucrative.",
  },
  pisces: {
    prediction: "Neptune heightens your spiritual awareness. Intuition and creativity are your guides.",
    health: "Feet and lymphatic system need care. Proper footwear and hydration help.",
    career: "Creative projects and artistic endeavors receive recognition and reward.",
    love: "Soulful connections deepen. Empathy and understanding strengthen bonds.",
    finance: "Avoid confusion in financial matters. Seek clarity before signing documents.",
  },
};

const PREDICTIONS_HI: Record<string, PredictionFields> = {
  aries: {
    prediction: "ग्रहों की स्थिति आज साहसिक निर्णयों के अनुकूल है। आपके नेतृत्व गुण चमकेंगे।",
    health: "ऊर्जा का स्तर उच्च है। इसे व्यायाम और ध्यान के माध्यम से प्रवाहित करें।",
    career: "कोई नया अवसर या प्रोजेक्ट आपके पास आ सकता है। अपनी अंतरात्मा पर विश्वास रखें।",
    love: "मंगल ग्रह संबंधों में जुनून लाएगा। अपनी भावनाएँ खुलकर व्यक्त करें।",
    finance: "गुरु की कृपा से धन लाभ के योग हैं। आवेगपूर्ण खर्चों से बचें।",
  },
  taurus: {
    prediction: "शुक्र देव आज स्थिरता और सामंजस्य का आशीर्वाद देंगे। दीर्घकालिक लक्ष्यों पर ध्यान दें।",
    health: "गले और गर्दन का ध्यान रखें। आज पर्याप्त पानी पीना आवश्यक है।",
    career: "आपके व्यावहारिक कौशल की सराहना होगी। पदोन्नति या वेतन वृद्धि निकट हो सकती है।",
    love: "गहरे संबंध आज और मजबूत होंगे। प्रियजनों के साथ गुणवत्तापूर्ण समय बिताएँ।",
    finance: "निवेश या बचत के लिए शुभ दिन है। विलासिता की वस्तुओं की खरीद से बचें।",
  },
  gemini: {
    prediction: "बुध आज आपके मस्तिष्क को ऊर्जा देंगे। संवाद और नेटवर्किंग से नए द्वार खुलेंगे।",
    health: "तंत्रिका तंत्र को विश्राम चाहिए। अधिक सोचने से बचें और सजगता का अभ्यास करें।",
    career: "आपके विचार सराहे जाएँगे। प्रस्तुति और बैठकों के लिए उत्तम दिन।",
    love: "हास-परिहास भरी बातचीत लोगों को निकट लाएगी। नए परिचयों के लिए तैयार रहें।",
    finance: "आय के एक से अधिक स्रोत बन सकते हैं। वित्तीय व्यवस्था बनाए रखें।",
  },
  cancer: {
    prediction: "चन्द्रमा आपकी अंतर्ज्ञान शक्ति बढ़ाएगा। महत्वपूर्ण निर्णयों में अंतरात्मा की आवाज़ सुनें।",
    health: "भावनात्मक स्वास्थ्य पर ध्यान दें। डायरी लिखना या ध्यान सहायक होगा।",
    career: "आपके पोषण देने वाले गुण टीम कार्य में सहायक होंगे। नेतृत्व सहज आएगा।",
    love: "घर और परिवार आनन्द देंगे। प्रियजनों के साथ विशेष संध्या की योजना बनाएँ।",
    finance: "आज की गई बचत योजना भविष्य में फलदायी होगी। खर्च में संयम बरतें।",
  },
  leo: {
    prediction: "सूर्य देव आज आपका मार्ग प्रशस्त करेंगे। आपका तेज सफलता और सम्मान आकर्षित करेगा।",
    health: "हृदय स्वास्थ्य महत्वपूर्ण है। हल्का कार्डियो व सन्तुलित आहार लें।",
    career: "आपके रचनात्मक विचार उभरकर सामने आएँगे। यह नेतृत्व और प्रेरणा का समय है।",
    love: "रोमांटिक ऊर्जा प्रबल है। अपने साथी के लिए कुछ विशेष योजना बनाएँ।",
    finance: "सट्टा निवेश अनुकूल दिख रहे हैं। निर्णय से पूर्व विशेषज्ञ से परामर्श लें।",
  },
  virgo: {
    prediction: "बुध आज आपकी विश्लेषणात्मक बुद्धि को तीक्ष्ण करेंगे। सूक्ष्म बातों पर ध्यान दें।",
    health: "पाचन तंत्र का ध्यान रखें। स्वच्छ भोजन लें, प्रसंस्कृत आहार से बचें।",
    career: "आपकी सूक्ष्म कार्यशैली से वरिष्ठ अधिकारी प्रभावित होंगे। पहचान मिलेगी।",
    love: "सेवाभाव से रिश्ते मजबूत होंगे। विचारपूर्ण कार्यों से प्रेम व्यक्त करें।",
    finance: "वित्त के प्रति व्यवस्थित दृष्टिकोण लाभदायक रहेगा। आज बजट की समीक्षा करें।",
  },
  libra: {
    prediction: "शुक्र आज जीवन में सौंदर्य और सन्तुलन लाएँगे। सभी क्षेत्रों में सामंजस्य रहेगा।",
    health: "गुर्दे और कमर के निचले भाग पर ध्यान दें। पर्याप्त जल और नियमित स्ट्रेच आवश्यक।",
    career: "साझेदारी एवं सहयोग में प्रगति होगी। कूटनीतिक कौशल विवाद सुलझाएँगे।",
    love: "प्रेम का वातावरण है। साथी के लिए कोई सार्थक उपहार या इशारा करें।",
    finance: "खातों का सन्तुलन रखें, ऋण से बचें। मध्यम दृष्टिकोण स्थिरता देगा।",
  },
  scorpio: {
    prediction: "प्लूटो आज आपकी दृष्टि गहरी करेगा। परिवर्तन और नवीनीकरण आज के विषय हैं।",
    health: "प्रजनन एवं रोग प्रतिरोधक तंत्र पर ध्यान दें। विश्राम व उचित पोषण सहायक।",
    career: "आपकी अनुसन्धान-दृष्टि छिपे अवसर खोजेगी। अपनी जाँच पर भरोसा करें।",
    love: "तीव्र भावनात्मक बन्धन बनेंगे या गहरे होंगे। संवेदनशीलता शक्ति है।",
    finance: "साझा संसाधन या उत्तराधिकार सम्बन्धी विषय उभर सकते हैं। सावधानी से निपटें।",
  },
  sagittarius: {
    prediction: "गुरु आज आपके क्षितिज विस्तृत करेंगे। यात्रा, शिक्षा और विकास के लिए शुभ।",
    health: "नितम्ब और जाँघ क्षेत्र को स्ट्रेच की आवश्यकता है। बाहरी गतिविधियाँ स्फूर्ति देंगी।",
    career: "उच्च शिक्षा या अन्तरराष्ट्रीय सम्बन्धों से करियर में सफलता मिलेगी।",
    love: "रिश्तों में रोमांच और स्वतंत्रता सही लोगों को आकर्षित करेगी।",
    finance: "दीर्घकालिक निवेश आशाजनक हैं। जुआ या सट्टा से बचें।",
  },
  capricorn: {
    prediction: "शनि देव आज आपके अनुशासन का फल देंगे। परिश्रम सीधे परिणामों में बदलेगा।",
    health: "हड्डियों और जोड़ों का ध्यान आवश्यक है। नियमित व्यायाम एवं कैल्शियम युक्त आहार लें।",
    career: "वरिष्ठ अधिकारी आपके प्रयासों को मान्यता देंगे। पदोन्नति या नई जिम्मेदारियाँ मिल सकती हैं।",
    love: "स्थिरता और प्रतिबद्धता आज आपके सम्बन्धों की शक्ति है।",
    finance: "रूढ़िवादी आर्थिक रणनीति धन की रक्षा करेगी। समझदारी से निवेश करें।",
  },
  aquarius: {
    prediction: "यूरेनस आज नवाचार जगाएगा। आपका विशिष्ट दृष्टिकोण सकारात्मक ध्यान आकर्षित करेगा।",
    health: "रक्त संचार तंत्र पर ध्यान दें। हल्का एरोबिक व्यायाम लाभकारी रहेगा।",
    career: "तकनीक और नवाचार से जुड़े प्रोजेक्ट आपके नेतृत्व में सफल होंगे।",
    love: "मैत्री ही स्थायी प्रेम की नींव बनेगी। मानसिक स्तर पर जुड़ाव करें।",
    finance: "अपरम्परागत निवेश विचार आश्चर्यजनक रूप से लाभकारी सिद्ध हो सकते हैं।",
  },
  pisces: {
    prediction: "नेपच्यून आज आपकी आध्यात्मिक चेतना बढ़ाएगा। अंतर्ज्ञान एवं रचनात्मकता आपके मार्गदर्शक हैं।",
    health: "पैरों और लिम्फ तंत्र का ध्यान रखें। उचित जूते व पर्याप्त जल सहायक।",
    career: "रचनात्मक प्रोजेक्ट और कलात्मक प्रयासों को पहचान व पुरस्कार मिलेंगे।",
    love: "आत्मीय जुड़ाव और गहरे होंगे। सहानुभूति व समझ रिश्तों को मजबूत करेगी।",
    finance: "वित्तीय मामलों में भ्रम से बचें। दस्तावेज़ पर हस्ताक्षर से पूर्व स्पष्टता प्राप्त करें।",
  },
};

const LUCKY_COLORS_EN: Record<string, string> = {
  aries: "Red", taurus: "Green", gemini: "Yellow", cancer: "White",
  leo: "Gold", virgo: "Navy Blue", libra: "Pink", scorpio: "Crimson",
  sagittarius: "Purple", capricorn: "Brown", aquarius: "Electric Blue", pisces: "Sea Green",
};

const LUCKY_COLORS_HI: Record<string, string> = {
  aries: "लाल", taurus: "हरा", gemini: "पीला", cancer: "श्वेत",
  leo: "स्वर्ण", virgo: "गहरा नीला", libra: "गुलाबी", scorpio: "गहरा लाल",
  sagittarius: "बैंगनी", capricorn: "भूरा", aquarius: "विद्युत नीला", pisces: "समुद्री हरा",
};

const LUCKY_NUMBERS: Record<string, number> = {
  aries: 9, taurus: 6, gemini: 5, cancer: 2, leo: 1, virgo: 5,
  libra: 6, scorpio: 8, sagittarius: 3, capricorn: 8, aquarius: 4, pisces: 7,
};

const RATINGS: Record<string, number> = {
  aries: 4, taurus: 5, gemini: 4, cancer: 3, leo: 5, virgo: 4,
  libra: 5, scorpio: 3, sagittarius: 4, capricorn: 4, aquarius: 3, pisces: 5,
};

type Lang = "en" | "hi";

function pickLang(raw: unknown): Lang {
  return raw === "hi" ? "hi" : "en";
}

export function getDailyHoroscopeBySign(sign: string, lang: Lang = "en") {
  const s = sign.toLowerCase();
  const info = ZODIAC_SIGNS[s];
  const predsEn = PREDICTIONS_EN[s];
  const predsHi = PREDICTIONS_HI[s];
  const today = new Date().toISOString().split("T")[0];

  if (!info || !predsEn || !predsHi) {
    throw new Error(`Invalid zodiac sign: ${sign}`);
  }

  const preds = lang === "hi" ? predsHi : predsEn;
  const luckyColor = lang === "hi" ? LUCKY_COLORS_HI[s] : LUCKY_COLORS_EN[s];
  const luckyGem = lang === "hi" ? info.gemHi : info.gem;
  const compatibility = lang === "hi" ? info.compatibleHi : info.compatible;

  return {
    sign: s.charAt(0).toUpperCase() + s.slice(1),
    signHindi: info.hindi,
    date: today,
    prediction: preds.prediction,
    health: preds.health,
    career: preds.career,
    love: preds.love,
    finance: preds.finance,
    luckyColor: luckyColor ?? "White",
    luckyNumber: LUCKY_NUMBERS[s] ?? 7,
    luckyGem,
    compatibility,
    rating: RATINGS[s] ?? 3,
    emoji: info.emoji,
  };
}

// GET /api/horoscope/daily
router.get("/horoscope/daily", (req, res) => {
  try {
    const lang = pickLang(req.query.lang);
    const signs = Object.keys(ZODIAC_SIGNS);
    const horoscopes = signs.map((sign) => getDailyHoroscopeBySign(sign, lang));
    res.json(horoscopes);
  } catch (err) {
    req.log.error({ err }, "Error getting daily horoscopes");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/horoscope/daily/:sign
router.get("/horoscope/daily/:sign", (req, res) => {
  try {
    const { sign } = req.params;
    const lang = pickLang(req.query.lang);
    const horoscope = getDailyHoroscopeBySign(sign, lang);
    res.json(horoscope);
  } catch {
    res.status(400).json({ error: "Invalid zodiac sign" });
  }
});

// GET /api/horoscope/weekly/:sign
router.get("/horoscope/weekly/:sign", (req, res) => {
  try {
    const { sign } = req.params;
    const lang = pickLang(req.query.lang);
    const daily = getDailyHoroscopeBySign(sign, lang);
    const weeklyPrefix =
      lang === "hi"
        ? "इस सप्ताह: "
        : "This week: ";
    const weeklySuffix =
      lang === "hi"
        ? " आने वाले दिन परिवर्तन और अवसरों की लहर लाएँगे। अपने लक्ष्यों पर केंद्रित रहें और ब्रह्मांडीय मार्गदर्शन पर विश्वास करें।"
        : " The coming days bring a wave of transformation and opportunities. Stay focused on your goals and trust in the cosmic guidance.";
    res.json({
      ...daily,
      prediction: `${weeklyPrefix}${daily.prediction}${weeklySuffix}`,
    });
  } catch {
    res.status(400).json({ error: "Invalid zodiac sign" });
  }
});

export default router;
