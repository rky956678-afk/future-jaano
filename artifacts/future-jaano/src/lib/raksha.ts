// Curated bilingual content for women's protection from negative energies
// (bhoot-pret, buri nazar, kala jadu, pitra dosh). Based on traditional
// Sanatan Dharma practices — Hanuman, Durga, Mahakaal, Bhairav remedies.
// No AI cost — fully static, instant load.

export interface Symptom {
  id: string;
  emoji: string;
  en: string;
  hi: string;
}

export interface ProtectionMantra {
  id: string;
  titleEn: string;
  titleHi: string;
  deity: string;
  sanskrit: string;
  transliteration: string;
  meaningEn: string;
  meaningHi: string;
  benefitsEn: string;
  benefitsHi: string;
  repetitions: number;
  bestTimeEn: string;
  bestTimeHi: string;
  power: 'core' | 'high' | 'supreme';
}

export interface Remedy {
  id: string;
  category: 'daily' | 'weekly' | 'emergency' | 'vastu' | 'taveez';
  emoji: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  itemsEn?: string[];
  itemsHi?: string[];
}

export const SYMPTOMS: Symptom[] = [
  { id: 's1', emoji: '😰', en: 'Sudden unexplained fear, especially at night', hi: 'अकारण भय, विशेषकर रात में' },
  { id: 's2', emoji: '😴', en: 'Repeated nightmares or sleep paralysis', hi: 'बार-बार बुरे सपने या नींद में दबाव' },
  { id: 's3', emoji: '🤕', en: 'Persistent headache that doctors cannot explain', hi: 'लगातार सिरदर्द जिसका कारण डॉक्टर न बता पाएँ' },
  { id: 's4', emoji: '😡', en: 'Sudden anger, irritability without reason', hi: 'अकारण क्रोध, चिड़चिड़ापन' },
  { id: 's5', emoji: '🥀', en: 'Loss of appetite, weight loss, weakness', hi: 'भूख न लगना, वजन कम होना, कमज़ोरी' },
  { id: 's6', emoji: '🪞', en: 'Feeling watched or presence in the room', hi: 'किसी की उपस्थिति या देखे जाने का अहसास' },
  { id: 's7', emoji: '🌑', en: 'Repeated dreams of dirty water, snakes, dead people', hi: 'गंदा पानी, साँप, मृत व्यक्तियों के बार-बार सपने' },
  { id: 's8', emoji: '💔', en: 'Sudden tension in relationships, family fights', hi: 'अचानक रिश्तों में तनाव, पारिवारिक कलह' },
  { id: 's9', emoji: '💸', en: 'Money slipping away despite earning', hi: 'कमाई के बावजूद पैसा टिकता नहीं' },
  { id: 's10', emoji: '🩺', en: 'Frequent illness, especially after visiting certain places', hi: 'बार-बार बीमारी, विशेषकर किसी स्थान पर जाने के बाद' },
  { id: 's11', emoji: '😞', en: 'Heaviness in chest, breathlessness without cause', hi: 'छाती में भारीपन, अकारण साँस फूलना' },
  { id: 's12', emoji: '👁️', en: 'Children crying suddenly, refusing to sleep alone', hi: 'बच्चों का अचानक रोना, अकेले सोने से डरना' },
];

export const PROTECTION_MANTRAS: ProtectionMantra[] = [
  {
    id: 'hanuman-beej',
    titleEn: 'Hanuman Beej Mantra',
    titleHi: 'हनुमान बीज मंत्र',
    deity: 'Hanuman',
    sanskrit: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्',
    transliteration: 'Om Hum Hanumate Rudratmakaya Hum Phat',
    meaningEn: 'Salutations to Hanuman, the fierce form of Rudra — destroyer of all evil forces.',
    meaningHi: 'रुद्र स्वरूप हनुमान जी को नमन — समस्त नकारात्मक शक्तियों के विनाशक।',
    benefitsEn: 'Most powerful mantra against ghosts, spirits, black magic. Creates a protective shield around the body.',
    benefitsHi: 'भूत-प्रेत, बुरी आत्माओं, काले जादू के विरुद्ध सर्वोत्तम। शरीर के चारों ओर सुरक्षा कवच।',
    repetitions: 108,
    bestTimeEn: 'Tuesday & Saturday after sunset, facing south',
    bestTimeHi: 'मंगलवार और शनिवार सूर्यास्त के बाद, दक्षिण मुख',
    power: 'supreme',
  },
  {
    id: 'bajrang-baan',
    titleEn: 'Bajrang Baan (key verse)',
    titleHi: 'बजरंग बाण (मुख्य चौपाई)',
    deity: 'Hanuman',
    sanskrit: 'भूत-प्रेत-पिशाच-निशाचर। अग्निबेताल-काल-मारीमर ॥\nइन्हें मारु, तोहि शपथ राम की। राखु नाथ मरजाद नाम की ॥',
    transliteration: 'Bhoot-Pret-Pishach-Nishachar, Agni-Betaal-Kaal-Maarimar | Inhein maaru, tohi shapath Ram ki, Raakhu Nath marjaad naam ki',
    meaningEn: 'O Hanuman, by the oath of Rama, destroy all ghosts, spirits, demons, witches and protect the dignity of your name.',
    meaningHi: 'हे हनुमान, राम की शपथ से सभी भूत-प्रेत-पिशाच-डाकिनी को नष्ट करो और अपने नाम की मर्यादा रखो।',
    benefitsEn: 'Direct command to remove ghostly entities. Recite for 21 or 41 days for complete clearing.',
    benefitsHi: 'भूत-प्रेत हटाने का प्रत्यक्ष आदेश। 21 या 41 दिन निरंतर पाठ से पूर्ण शुद्धि।',
    repetitions: 11,
    bestTimeEn: 'Tuesday night, after bath, in front of Hanuman ji photo',
    bestTimeHi: 'मंगलवार रात, स्नान के बाद, हनुमान जी के चित्र के सामने',
    power: 'supreme',
  },
  {
    id: 'mahamrityunjaya',
    titleEn: 'Mahamrityunjaya Mantra',
    titleHi: 'महामृत्युंजय मंत्र',
    deity: 'Shiva',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात् ॥',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaningEn: 'We worship the three-eyed Lord Shiva, the fragrant nourisher. May He free us from the bondage of death and grant immortality.',
    meaningHi: 'त्रिनेत्र शिव की आराधना करते हैं। वे हमें मृत्यु के बंधन से मुक्त कर अमृत प्रदान करें।',
    benefitsEn: 'Removes fear of death, untimely danger, ghostly attacks. Heals chronic illness from negative energies.',
    benefitsHi: 'मृत्यु भय, आकस्मिक संकट, प्रेत बाधा दूर। नकारात्मक ऊर्जा से होने वाली बीमारी ठीक करता है।',
    repetitions: 108,
    bestTimeEn: 'Pradosh kaal (twilight) on Monday',
    bestTimeHi: 'सोमवार प्रदोष काल (सायं संध्या)',
    power: 'supreme',
  },
  {
    id: 'durga-saptashloki-1',
    titleEn: 'Durga Saptashloki — Verse 1',
    titleHi: 'दुर्गा सप्तश्लोकी — श्लोक 1',
    deity: 'Durga',
    sanskrit: 'ज्ञानिनामपि चेतांसि देवी भगवती हि सा ।\nबलादाकृष्य मोहाय महामाया प्रयच्छति ॥',
    transliteration: 'Jnaninam api chetamsi devi bhagavati hi sa, Baladaakrishya mohaaya mahaamaaya prayachchhati',
    meaningEn: 'Goddess Bhagavati, the great illusion, draws even the minds of the wise — surrender to Her removes all delusion.',
    meaningHi: 'भगवती महामाया ज्ञानियों के भी मन को आकर्षित करती हैं — उनकी शरण में जाने से सभी भ्रम मिटते हैं।',
    benefitsEn: 'Goddess Durga personally guards women devotees. Protects from kala jadu, tantra, evil eye.',
    benefitsHi: 'दुर्गा माँ स्त्री भक्तों की स्वयं रक्षा करती हैं। काला जादू, तंत्र, बुरी नज़र से बचाव।',
    repetitions: 21,
    bestTimeEn: 'Daily morning after bath, especially Tuesday & Friday',
    bestTimeHi: 'प्रतिदिन प्रातः स्नान के बाद, विशेषकर मंगलवार और शुक्रवार',
    power: 'supreme',
  },
  {
    id: 'kali-beej',
    titleEn: 'Kali Beej Mantra',
    titleHi: 'काली बीज मंत्र',
    deity: 'Kali',
    sanskrit: 'क्रीं क्रीं क्रीं हूं हूं ह्रीं ह्रीं दक्षिणे कालिके क्रीं क्रीं क्रीं हूं हूं ह्रीं ह्रीं स्वाहा',
    transliteration: 'Kreem Kreem Kreem Hum Hum Hreem Hreem Dakshine Kalike Kreem Kreem Kreem Hum Hum Hreem Hreem Swaha',
    meaningEn: 'Salutations to Goddess Kali — the fierce destroyer of all darkness and negative forces.',
    meaningHi: 'देवी काली को नमन — समस्त अंधकार और नकारात्मक शक्तियों की संहारिणी।',
    benefitsEn: 'Supreme weapon against tantra, vashikaran, severe haunting. Use only with guru guidance.',
    benefitsHi: 'तंत्र, वशीकरण, गंभीर प्रेत बाधा के विरुद्ध सर्वोच्च शस्त्र। गुरु के मार्गदर्शन में ही करें।',
    repetitions: 108,
    bestTimeEn: 'Amavasya midnight, facing south',
    bestTimeHi: 'अमावस्या की मध्य रात्रि, दक्षिण मुख',
    power: 'supreme',
  },
  {
    id: 'kalbhairav',
    titleEn: 'Kal Bhairav Mantra',
    titleHi: 'काल भैरव मंत्र',
    deity: 'Bhairav',
    sanskrit: 'ॐ ह्रीं बं बटुकाय आपदुद्धारणाय कुरु कुरु बटुकाय ह्रीं ॐ',
    transliteration: 'Om Hreem Bam Batukaya Aapaduddharanaya Kuru Kuru Batukaya Hreem Om',
    meaningEn: 'O Batuk Bhairav, remove all dangers, troubles and protect from sudden calamities.',
    meaningHi: 'हे बटुक भैरव, समस्त संकट दूर करो और अकस्मात विपत्तियों से रक्षा करो।',
    benefitsEn: 'Kshetrapal — guardian of place. Removes paranormal disturbances from home, removes pitra dosh.',
    benefitsHi: 'क्षेत्रपाल — स्थान के रक्षक। घर की अदृश्य बाधाएँ और पितृ दोष दूर करते हैं।',
    repetitions: 108,
    bestTimeEn: 'Sunday & Tuesday night, offer black sesame',
    bestTimeHi: 'रविवार और मंगलवार रात, काले तिल अर्पित करें',
    power: 'high',
  },
  {
    id: 'navarn',
    titleEn: 'Navarn Mantra (Chandi)',
    titleHi: 'नवार्ण मंत्र (चण्डी)',
    deity: 'Chandi',
    sanskrit: 'ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    transliteration: 'Aim Hreem Kleem Chamundaye Vichche',
    meaningEn: 'Nine-syllable mantra of Goddess Chamunda — destroys Chanda and Munda (forces of confusion and ego).',
    meaningHi: 'देवी चामुण्डा का नवाक्षरी मंत्र — चण्ड और मुण्ड (भ्रम और अहंकार की शक्तियों) का नाश करता है।',
    benefitsEn: 'For unmarried girls: clears obstacles in marriage; for married women: protects family from evil eye.',
    benefitsHi: 'अविवाहित कन्याओं के लिए विवाह बाधा दूर; विवाहित स्त्रियों के लिए परिवार पर नज़र दोष से सुरक्षा।',
    repetitions: 108,
    bestTimeEn: 'Brahma muhurat (before sunrise)',
    bestTimeHi: 'ब्रह्म मुहूर्त (सूर्योदय से पूर्व)',
    power: 'high',
  },
  {
    id: 'ram-raksha',
    titleEn: 'Ram Raksha Mantra',
    titleHi: 'राम रक्षा मंत्र',
    deity: 'Ram',
    sanskrit: 'श्री रामचन्द्र चरणौ मनसा स्मरामि ।\nश्री रामचन्द्र चरणौ वचसा गृणामि ॥\nश्री रामचन्द्र चरणौ शिरसा नमामि ।\nश्री रामचन्द्र चरणौ शरणं प्रपद्ये ॥',
    transliteration: 'Shri Ramachandra Charanau Manasaa Smaraami | Shri Ramachandra Charanau Vachasaa Grinaami | Shri Ramachandra Charanau Shirasaa Namaami | Shri Ramachandra Charanau Sharanam Prapadye',
    meaningEn: 'I remember, praise, bow to, and take refuge in the feet of Lord Ramachandra.',
    meaningHi: 'मैं भगवान रामचन्द्र के चरणों का स्मरण, स्तुति, नमन करता हूँ और उनकी शरण लेता हूँ।',
    benefitsEn: 'Gentle protection mantra — safe for daily recitation, builds spiritual shield over time.',
    benefitsHi: 'सौम्य रक्षा मंत्र — दैनिक जप के लिए सुरक्षित, समय के साथ आध्यात्मिक कवच बनाता है।',
    repetitions: 11,
    bestTimeEn: 'Anytime, especially before sleep',
    bestTimeHi: 'किसी भी समय, विशेषकर सोने से पहले',
    power: 'core',
  },
];

export const REMEDIES: Remedy[] = [
  // DAILY
  {
    id: 'r1',
    category: 'daily',
    emoji: '🛕',
    titleEn: 'Morning Hanuman Chalisa',
    titleHi: 'प्रातः हनुमान चालीसा',
    descriptionEn: 'Recite full Hanuman Chalisa after bath. Light a diya with mustard oil in front of Hanuman ji.',
    descriptionHi: 'स्नान के बाद पूर्ण हनुमान चालीसा का पाठ करें। हनुमान जी के सामने सरसों के तेल का दीपक जलाएँ।',
  },
  {
    id: 'r2',
    category: 'daily',
    emoji: '🧂',
    titleEn: 'Salt water foot wash before entering home',
    titleHi: 'घर में प्रवेश से पहले नमक-पानी से पैर धोएँ',
    descriptionEn: 'After returning from outside (markets, hospitals, funerals), wash feet with water mixed with rock salt at the door.',
    descriptionHi: 'बाहर से (बाज़ार, अस्पताल, श्मशान) लौटकर दरवाज़े पर सेंधा नमक मिले पानी से पैर धोएँ।',
  },
  {
    id: 'r3',
    category: 'daily',
    emoji: '🌿',
    titleEn: 'Tulsi worship every morning',
    titleHi: 'प्रतिदिन तुलसी पूजन',
    descriptionEn: 'Water Tulsi plant every morning, light a diya in evening. Tulsi removes negative vibrations from home.',
    descriptionHi: 'प्रतिदिन सुबह तुलसी में जल चढ़ाएँ, शाम को दीपक जलाएँ। तुलसी घर की नकारात्मक तरंगें हटाती है।',
  },
  {
    id: 'r4',
    category: 'daily',
    emoji: '🔥',
    titleEn: 'Loban / Guggul dhoop in evening',
    titleHi: 'शाम को लोबान / गुग्गुल की धूनी',
    descriptionEn: 'Burn loban or guggul on hot coal at sunset (sandhya kaal) — circulate smoke in every room.',
    descriptionHi: 'सूर्यास्त (संध्या काल) के समय गरम कोयले पर लोबान या गुग्गुल जलाएँ — हर कमरे में धुआँ घुमाएँ।',
  },

  // WEEKLY
  {
    id: 'r5',
    category: 'weekly',
    emoji: '⚫',
    titleEn: 'Tuesday — Sundarkand path',
    titleHi: 'मंगलवार — सुंदरकाण्ड पाठ',
    descriptionEn: 'Recite Sundarkand on Tuesday evening. Offer boondi laddu, jasmine garland to Hanuman ji.',
    descriptionHi: 'मंगलवार शाम सुंदरकाण्ड पाठ करें। हनुमान जी को बूँदी के लड्डू, चमेली की माला अर्पित करें।',
  },
  {
    id: 'r6',
    category: 'weekly',
    emoji: '🌹',
    titleEn: 'Friday — Durga Saptashati path',
    titleHi: 'शुक्रवार — दुर्गा सप्तशती पाठ',
    descriptionEn: 'Goddess Durga is the supreme protector of women. Read at least Argala Stotram and Saptashloki on Friday.',
    descriptionHi: 'दुर्गा माँ स्त्रियों की सर्वोच्च रक्षक हैं। शुक्रवार को कम से कम अर्गला स्तोत्र और सप्तश्लोकी पढ़ें।',
  },
  {
    id: 'r7',
    category: 'weekly',
    emoji: '🥥',
    titleEn: 'Saturday — Black sesame & mustard oil',
    titleHi: 'शनिवार — काले तिल और सरसों का तेल',
    descriptionEn: 'Saturday evening: rotate a coconut over your head 7 times and drop in flowing water. Removes accumulated negativity.',
    descriptionHi: 'शनिवार शाम: एक नारियल अपने सिर के ऊपर से 7 बार वार कर बहते जल में प्रवाहित करें। संचित नकारात्मकता हटती है।',
  },

  // EMERGENCY (when symptoms are strong)
  {
    id: 'r8',
    category: 'emergency',
    emoji: '🚨',
    titleEn: 'Alum (Fitkari) over the head',
    titleHi: 'फिटकरी को सिर से वार करना',
    descriptionEn: 'Take a piece of alum, rotate 7 times clockwise over the affected person\'s head, then burn it in fire. The alum will turn into the face of the entity causing harm.',
    descriptionHi: 'फिटकरी का टुकड़ा लें, पीड़ित व्यक्ति के सिर के ऊपर से 7 बार दक्षिणावर्त घुमाएँ, फिर अग्नि में जलाएँ। फिटकरी पीड़ा देने वाली शक्ति का रूप ले लेगी।',
    itemsEn: ['White alum (fitkari) — 1 piece', 'Iron tongs', 'Coal or kandha fire'],
    itemsHi: ['सफ़ेद फिटकरी — 1 टुकड़ा', 'लोहे का चिमटा', 'कोयला या कंडे की अग्नि'],
  },
  {
    id: 'r9',
    category: 'emergency',
    emoji: '🌶️',
    titleEn: 'Red chilli & rock salt nazar utarna',
    titleHi: 'लाल मिर्च और नमक से नज़र उतारना',
    descriptionEn: 'Take 7 dry red chillies + handful of rock salt, rotate 7 times over affected person, burn in fire. If smoke is non-pungent, evil eye was strong.',
    descriptionHi: '7 साबुत लाल मिर्च + एक मुट्ठी सेंधा नमक लें, पीड़ित के ऊपर से 7 बार वार कर अग्नि में डालें। यदि धुआँ तीखा न हो, तो नज़र भारी थी।',
    itemsEn: ['7 dry red chillies', 'Handful of rock salt', 'Iron pan or coal'],
    itemsHi: ['7 साबुत सूखी लाल मिर्च', 'एक मुट्ठी सेंधा नमक', 'लोहे का तवा या कोयला'],
  },
  {
    id: 'r10',
    category: 'emergency',
    emoji: '🛁',
    titleEn: 'Ganga jal + Tulsi bath',
    titleHi: 'गंगाजल + तुलसी स्नान',
    descriptionEn: 'Mix 1 spoon Ganga jal + 11 tulsi leaves + a pinch of rock salt in bath water. Recite Hanuman Chalisa while bathing. Do this for 7 consecutive Tuesdays.',
    descriptionHi: 'स्नान के पानी में 1 चम्मच गंगाजल + 11 तुलसी पत्र + चुटकी भर सेंधा नमक मिलाएँ। स्नान करते समय हनुमान चालीसा का पाठ करें। लगातार 7 मंगलवार करें।',
    itemsEn: ['Ganga jal', '11 fresh tulsi leaves', 'Rock salt'],
    itemsHi: ['गंगाजल', '11 ताज़े तुलसी पत्र', 'सेंधा नमक'],
  },

  // VASTU PROTECTION
  {
    id: 'r11',
    category: 'vastu',
    emoji: '🚪',
    titleEn: 'Hanuman ji photo on main door',
    titleHi: 'मुख्य द्वार पर हनुमान जी का चित्र',
    descriptionEn: 'Place a flying Hanuman or Panchmukhi Hanuman photo facing outwards on the main door. No negative energy can cross this threshold.',
    descriptionHi: 'मुख्य द्वार पर उड़ते हनुमान या पंचमुखी हनुमान का चित्र बाहर की ओर लगाएँ। कोई नकारात्मक शक्ति इस दहलीज़ को पार नहीं कर सकती।',
  },
  {
    id: 'r12',
    category: 'vastu',
    emoji: '🪞',
    titleEn: 'Remove broken mirrors & old photos',
    titleHi: 'टूटे शीशे और पुराने चित्र हटाएँ',
    descriptionEn: 'Broken mirrors, faded photos of dead ancestors in main rooms attract heavy spirit energies. Keep ancestor photos in pooja room only.',
    descriptionHi: 'टूटे शीशे, मृत पूर्वजों के धूमिल चित्र मुख्य कमरों में भारी प्रेत ऊर्जा खींचते हैं। पूर्वजों के चित्र केवल पूजा कक्ष में रखें।',
  },
  {
    id: 'r13',
    category: 'vastu',
    emoji: '🌊',
    titleEn: 'Sea salt bowl in corners',
    titleHi: 'कोनों में समुद्री नमक का कटोरा',
    descriptionEn: 'Place a glass bowl of sea salt in each corner of the bedroom. Replace every 15 days — discard old salt in flowing water, never in dustbin.',
    descriptionHi: 'शयन कक्ष के हर कोने में काँच के कटोरे में समुद्री नमक रखें। हर 15 दिन बदलें — पुराना नमक बहते पानी में बहाएँ, कूड़ेदान में कभी नहीं।',
  },
  {
    id: 'r14',
    category: 'vastu',
    emoji: '🪔',
    titleEn: 'Pooja room ghee diya at sandhya',
    titleHi: 'संध्या काल पूजा घर में घी का दीपक',
    descriptionEn: 'Light a pure cow ghee diya at sunset (6-7 PM) in pooja room. Sandhya is the most powerful time — even a small diya creates a shield around the entire home.',
    descriptionHi: 'सूर्यास्त (6-7 बजे) पूजा घर में शुद्ध गाय के घी का दीपक जलाएँ। संध्या सबसे शक्तिशाली समय है — छोटा सा दीपक भी पूरे घर पर कवच बनाता है।',
  },

  // TAVEEZ / KAVACH
  {
    id: 'r15',
    category: 'taveez',
    emoji: '⚫',
    titleEn: 'Kala dhaga (black thread) on left wrist/ankle',
    titleHi: 'बाएँ कलाई/टखने पर काला धागा',
    descriptionEn: 'Have a temple pandit chant Hanuman mantra over a black thread, tie on left wrist for unmarried girls, left ankle for married women. Replace after 11 weeks.',
    descriptionHi: 'मंदिर के पंडित से काले धागे पर हनुमान मंत्र पढ़वाएँ, अविवाहित कन्या बाएँ कलाई पर, विवाहिता बाएँ टखने पर बाँधें। 11 सप्ताह बाद बदलें।',
  },
  {
    id: 'r16',
    category: 'taveez',
    emoji: '🔱',
    titleEn: 'Silver Hanuman locket',
    titleHi: 'चाँदी का हनुमान लॉकेट',
    descriptionEn: 'Wear a silver Hanuman or Panchmukhi Hanuman locket consecrated at a Hanuman temple on Tuesday in Shukla paksha.',
    descriptionHi: 'शुक्ल पक्ष के मंगलवार को हनुमान मंदिर में प्राण-प्रतिष्ठित चाँदी का हनुमान या पंचमुखी हनुमान लॉकेट धारण करें।',
  },
  {
    id: 'r17',
    category: 'taveez',
    emoji: '📿',
    titleEn: 'Rudraksha 5-mukhi mala',
    titleHi: 'पाँच मुखी रुद्राक्ष माला',
    descriptionEn: 'Wear a 5-mukhi rudraksha mala (108 beads) energized with Mahamrityunjaya mantra 108 times. Protects from sudden danger and negative energies.',
    descriptionHi: 'महामृत्युंजय मंत्र 108 बार से अभिमंत्रित 5 मुखी रुद्राक्ष माला (108 दाने) धारण करें। आकस्मिक संकट और नकारात्मक ऊर्जा से रक्षा।',
  },
  {
    id: 'r18',
    category: 'taveez',
    emoji: '🛡️',
    titleEn: 'Bhairav Kavach written on bhojpatra',
    titleHi: 'भोजपत्र पर लिखा भैरव कवच',
    descriptionEn: 'Get Bhairav Kavach written on bhojpatra by a Tantra-acharya, sealed in copper taveez. Most powerful for severe cases — only with verified guru.',
    descriptionHi: 'किसी तंत्र-आचार्य से भोजपत्र पर भैरव कवच लिखवाकर ताम्र ताबीज़ में बंद करवाएँ। गंभीर मामलों में सर्वोत्तम — केवल प्रामाणिक गुरु से।',
  },
];

export const REMEDY_CATEGORIES: { code: Remedy['category']; en: string; hi: string; emoji: string }[] = [
  { code: 'daily', en: 'Daily practice', hi: 'दैनिक अभ्यास', emoji: '☀️' },
  { code: 'weekly', en: 'Weekly puja', hi: 'साप्ताहिक पूजा', emoji: '📅' },
  { code: 'emergency', en: 'Emergency upaay', hi: 'आपातकालीन उपाय', emoji: '🚨' },
  { code: 'vastu', en: 'Vastu shield', hi: 'वास्तु कवच', emoji: '🏠' },
  { code: 'taveez', en: 'Taveez & kavach', hi: 'ताबीज़ और कवच', emoji: '🛡️' },
];
