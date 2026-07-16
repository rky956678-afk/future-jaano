import { db, subscriptionPlansTable, blogPostsTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Idempotent startup seeding — only inserts when tables are empty, so it is
 * safe to run on every boot (dev and production alike). Ensures the
 * Premium page always has plans and the Blog is never empty.
 */
export async function seedDatabase(): Promise<void> {
  try {
    await seedPlans();
    await seedBlog();
  } catch (err) {
    logger.warn({ err }, "[seed] Seeding skipped due to error (non-fatal)");
  }
}

async function seedPlans() {
  const existing = await db.select({ id: subscriptionPlansTable.id }).from(subscriptionPlansTable).limit(1);
  if (existing.length > 0) return;

  await db.insert(subscriptionPlansTable).values([
    {
      name: "Basic",
      nameHindi: "बेसिक",
      price: 9900, // paise
      duration: 30,
      features: JSON.stringify([
        "Daily horoscope for all signs",
        "1 Kundli report per month",
        "Problem solver (3 queries/month)",
        "Blog access",
      ]),
      isPopular: false,
    },
    {
      name: "Premium",
      nameHindi: "प्रीमियम",
      price: 29900,
      duration: 30,
      features: JSON.stringify([
        "Everything in Basic",
        "Unlimited Kundli & Kundli Milan",
        "Vastu, Palm & Face analysis",
        "Numerology & personalized Yoga plans",
        "Priority support",
      ]),
      isPopular: true,
    },
    {
      name: "Annual",
      nameHindi: "वार्षिक",
      price: 199900,
      duration: 365,
      features: JSON.stringify([
        "Everything in Premium",
        "12 months at the best price",
        "Muhurat & Dasha reports",
        "Early access to new features",
      ]),
      isPopular: false,
    },
  ]);
  logger.info("[seed] Inserted 3 subscription plans");
}

async function seedBlog() {
  const existing = await db.select({ id: blogPostsTable.id }).from(blogPostsTable).limit(1);
  if (existing.length > 0) return;

  const now = new Date();
  const posts = [
    {
      title: "Understanding Your Kundli: A Beginner's Guide",
      slug: "understanding-your-kundli-beginners-guide",
      excerpt: "What the twelve houses of your birth chart reveal about career, marriage, health and destiny — explained simply.",
      content: `A Kundli (birth chart) is a snapshot of the sky at the exact moment of your birth. It divides the heavens into twelve houses, each governing an area of life.\n\nThe 1st house (Lagna) represents your personality and physical self. The 2nd governs wealth and speech, the 4th home and mother, the 7th marriage and partnerships, and the 10th career and public reputation.\n\nThe placement of the nine grahas — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu — across these houses shapes your tendencies and timing of events. Benefic planets like Jupiter and Venus strengthen the houses they occupy, while Saturn teaches discipline through delay.\n\nWhen reading your Kundli, start with three things: your Lagna (ascendant), your Moon sign (which governs the mind), and the current Mahadasha. Together they explain most of what you are experiencing right now.\n\nGenerate your own AI-powered Kundli analysis on Future Jaano to see your doshas, remedies and lucky gemstone.`,
      category: "astrology",
      author: "Future Jaano Team",
      tags: "kundli,astrology,vedic,beginners",
      language: "en",
      isPublished: true,
      publishedAt: new Date(now.getTime() - 6 * 86400000),
      viewCount: 320,
    },
    {
      title: "वास्तु शास्त्र: घर की ऊर्जा सुधारने के 7 सरल उपाय",
      slug: "vastu-shastra-7-saral-upay",
      excerpt: "बिना तोड़-फोड़ के अपने घर की सकारात्मक ऊर्जा बढ़ाने के लिए वास्तु के आसान और व्यावहारिक उपाय।",
      content: `वास्तु शास्त्र के अनुसार घर की दिशाएँ हमारे जीवन की ऊर्जा को प्रभावित करती हैं। बिना किसी बड़े बदलाव के ये 7 उपाय अपनाएँ:\n\n1. ईशान कोण (उत्तर-पूर्व) को हमेशा स्वच्छ और हल्का रखें — यह जल और पूजा का स्थान है।\n2. मुख्य द्वार पर स्वस्तिक या तोरण लगाएँ और द्वार को साफ रखें।\n3. भारी फर्नीचर दक्षिण-पश्चिम दिशा में रखें।\n4. रसोई आग्नेय कोण (दक्षिण-पूर्व) में हो तो सर्वोत्तम; न हो तो गैस चूल्हा पूर्वमुखी रखें।\n5. सोते समय सिर दक्षिण या पूर्व दिशा में रखें।\n6. दर्पण उत्तर या पूर्व की दीवार पर लगाएँ।\n7. घर के मध्य भाग (ब्रह्मस्थान) को खाली और खुला रखें।\n\nअपने कमरे की फोटो अपलोड करके Future Jaano पर AI वास्तु विश्लेषण प्राप्त करें — दोष और उनके उपाय तुरंत जानें।`,
      category: "vastu",
      author: "Future Jaano Team",
      tags: "vastu,upay,hindi,ghar",
      language: "hi",
      isPublished: true,
      publishedAt: new Date(now.getTime() - 5 * 86400000),
      viewCount: 415,
    },
    {
      title: "Lal Kitab Remedies That Actually Work",
      slug: "lal-kitab-remedies-that-work",
      excerpt: "The famous 'red book' of astrology is loved for its simple, low-cost remedies. Here are the most trusted ones.",
      content: `Lal Kitab, written in the early 20th century, is unique among astrological texts for prescribing simple, practical remedies instead of expensive rituals.\n\nSome of the most widely practiced Lal Kitab remedies:\n\n• For Saturn's affliction: feed crows and donate mustard oil on Saturdays.\n• For a weak Jupiter: apply a saffron tilak and respect teachers and elders.\n• For Rahu problems: keep a solid silver ball in your pocket and donate coconut.\n• For financial blockages: float a copper coin in flowing water for 43 consecutive days.\n• For domestic peace: keep the entrance clean and offer the first roti to a cow.\n\nThe philosophy behind Lal Kitab is karma correction — small consistent acts of giving that rebalance planetary debts. Remedies should be done for 40-43 days without interruption.\n\nDescribe your problem on Future Jaano's Problem Solver and get personalized Lal Kitab, Atharvaveda and Vastu remedies instantly.`,
      category: "remedies",
      author: "Future Jaano Team",
      tags: "lal kitab,remedies,upay",
      language: "en",
      isPublished: true,
      publishedAt: new Date(now.getTime() - 4 * 86400000),
      viewCount: 508,
    },
    {
      title: "हस्तरेखा ज्ञान: हथेली की मुख्य रेखाएँ क्या कहती हैं",
      slug: "hastrekha-gyan-mukhya-rekhayen",
      excerpt: "जीवन रेखा, हृदय रेखा और मस्तिष्क रेखा — जानिए आपकी हथेली की तीन प्रमुख रेखाओं का अर्थ।",
      content: `हस्तरेखा शास्त्र (Palmistry) में हथेली की तीन मुख्य रेखाएँ सबसे महत्वपूर्ण मानी जाती हैं:\n\n**जीवन रेखा** — अंगूठे के चारों ओर वक्राकार चलती है। यह आयु नहीं बल्कि जीवन-शक्ति, स्वास्थ्य और ऊर्जा दर्शाती है। गहरी और स्पष्ट रेखा उत्तम प्राण-शक्ति का संकेत है।\n\n**हृदय रेखा** — हथेली के ऊपरी भाग में होती है। यह भावनाओं, प्रेम और संबंधों की प्रकृति बताती है। लंबी और स्पष्ट रेखा गहरे भावनात्मक जुड़ाव का प्रतीक है।\n\n**मस्तिष्क रेखा** — हथेली के मध्य से गुज़रती है। यह बुद्धि, सोचने का तरीका और निर्णय-क्षमता दर्शाती है। सीधी रेखा व्यावहारिक सोच और झुकी हुई रेखा रचनात्मकता की सूचक है।\n\nइनके अतिरिक्त भाग्य रेखा (करियर) और सूर्य रेखा (यश) भी देखी जाती हैं।\n\nFuture Jaano पर अपनी हथेली की फोटो अपलोड करें और AI से विस्तृत हस्तरेखा विश्लेषण पाएँ।`,
      category: "palmistry",
      author: "Future Jaano Team",
      tags: "hastrekha,palmistry,hindi",
      language: "hi",
      isPublished: true,
      publishedAt: new Date(now.getTime() - 3 * 86400000),
      viewCount: 287,
    },
    {
      title: "Numerology 101: Find Your Life Path Number",
      slug: "numerology-101-life-path-number",
      excerpt: "Your date of birth hides a single number that describes your life's core journey. Here's how to calculate and read it.",
      content: `Your Life Path number is the most important number in numerology — calculated by reducing your full date of birth to a single digit (or master numbers 11, 22, 33).\n\nExample: born 27-08-1995 → 2+7+0+8+1+9+9+5 = 41 → 4+1 = 5. Life Path 5.\n\nQuick meanings:\n1 — Leader, independent, pioneering\n2 — Diplomat, sensitive, cooperative\n3 — Creative, expressive, social\n4 — Builder, disciplined, reliable\n5 — Free spirit, adventurous, adaptable\n6 — Nurturer, responsible, family-oriented\n7 — Seeker, analytical, spiritual\n8 — Achiever, ambitious, material success\n9 — Humanitarian, compassionate, wise\n11/22/33 — Master numbers with amplified potential and challenges\n\nAlongside your Life Path, your Destiny number (from your name) shows what you're meant to accomplish, and your Soul Urge reveals inner motivations.\n\nGet your complete AI numerology report on Future Jaano in seconds.`,
      category: "numerology",
      author: "Future Jaano Team",
      tags: "numerology,life path,destiny",
      language: "en",
      isPublished: true,
      publishedAt: new Date(now.getTime() - 2 * 86400000),
      viewCount: 342,
    },
    {
      title: "मांगलिक दोष: भ्रम और वास्तविकता",
      slug: "manglik-dosh-bhram-aur-vastavikta",
      excerpt: "मांगलिक दोष को लेकर समाज में कई भ्रांतियाँ हैं। जानिए इसका वास्तविक अर्थ, प्रभाव और शास्त्रोक्त उपाय।",
      content: `कुंडली में मंगल जब 1, 4, 7, 8 या 12वें भाव में हो तो मांगलिक दोष माना जाता है। किंतु इसे लेकर भय अनावश्यक है।\n\n**महत्वपूर्ण तथ्य:**\n\n1. लगभग 40% कुंडलियों में मांगलिक योग होता है — यह अत्यंत सामान्य है।\n2. कई स्थितियों में दोष स्वतः भंग हो जाता है — जैसे मंगल स्वराशि (मेष/वृश्चिक) में हो, या गुरु की दृष्टि हो।\n3. दो मांगलिक व्यक्तियों का विवाह होने पर दोष प्रभावहीन माना जाता है।\n4. आयु बढ़ने के साथ (28 वर्ष के बाद) मंगल का प्रभाव स्वयं क्षीण होता है।\n\n**शास्त्रोक्त उपाय:** मंगलवार को हनुमान चालीसा का पाठ, मसूर दाल और लाल वस्त्र का दान, तथा 'ॐ अं अंगारकाय नमः' मंत्र का जप।\n\nविवाह से पूर्व Future Jaano पर कुंडली मिलान करें — 36 गुणों का विस्तृत AI विश्लेषण तुरंत पाएँ।`,
      category: "astrology",
      author: "Future Jaano Team",
      tags: "manglik,dosh,vivah,hindi",
      language: "hi",
      isPublished: true,
      publishedAt: new Date(now.getTime() - 1 * 86400000),
      viewCount: 463,
    },
  ];

  await db.insert(blogPostsTable).values(posts);
  logger.info(`[seed] Inserted ${posts.length} blog posts`);
}
