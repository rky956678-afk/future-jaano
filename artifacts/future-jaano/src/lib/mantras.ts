export type MantraCategory =
  | 'shiva'
  | 'vishnu'
  | 'devi'
  | 'ganesh'
  | 'hanuman'
  | 'navagraha'
  | 'peace'
  | 'general';

export interface Mantra {
  id: string;
  category: MantraCategory;
  titleEn: string;
  titleHi: string;
  sanskrit: string;
  transliteration: string;
  meaningEn: string;
  meaningHi: string;
  benefitsEn: string;
  benefitsHi: string;
  repetitions: number;
  bestTime: { en: string; hi: string };
}

export const MANTRA_CATEGORIES: { code: MantraCategory; en: string; hi: string; emoji: string }[] = [
  { code: 'general', en: 'All', hi: 'सभी', emoji: '🕉️' },
  { code: 'shiva', en: 'Shiva', hi: 'शिव', emoji: '🔱' },
  { code: 'vishnu', en: 'Vishnu / Krishna / Ram', hi: 'विष्णु / कृष्ण / राम', emoji: '🪷' },
  { code: 'devi', en: 'Devi (Durga / Lakshmi / Saraswati)', hi: 'देवी', emoji: '🌺' },
  { code: 'ganesh', en: 'Ganesh', hi: 'गणेश', emoji: '🐘' },
  { code: 'hanuman', en: 'Hanuman', hi: 'हनुमान', emoji: '🛕' },
  { code: 'navagraha', en: 'Navagraha (Planets)', hi: 'नवग्रह', emoji: '☀️' },
  { code: 'peace', en: 'Peace / Shanti', hi: 'शांति', emoji: '🕊️' },
];

export const MANTRAS: Mantra[] = [
  {
    id: 'gayatri',
    category: 'general',
    titleEn: 'Gayatri Mantra',
    titleHi: 'गायत्री मंत्र',
    sanskrit: 'ॐ भूर्भुवः स्वः । तत्सवितुर्वरेण्यं । भर्गो देवस्य धीमहि । धियो यो नः प्रचोदयात् ॥',
    transliteration: 'Om Bhur Bhuvah Svah, Tat-savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat',
    meaningEn: 'We meditate on the divine light of the radiant Sun. May that supreme intelligence illumine our minds.',
    meaningHi: 'हम उस दिव्य सविता देव के तेज का ध्यान करते हैं। वह हमारी बुद्धि को सत्य की ओर प्रेरित करें।',
    benefitsEn: 'Sharpens intellect, removes ignorance, brings divine wisdom and clarity.',
    benefitsHi: 'बुद्धि तेज करता है, अज्ञान दूर करता है, दिव्य ज्ञान देता है।',
    repetitions: 108,
    bestTime: { en: 'Sunrise, noon, sunset (Sandhya Vandan)', hi: 'सूर्योदय, मध्याह्न, सूर्यास्त (संध्या वंदन)' },
  },
  {
    id: 'mahamrityunjaya',
    category: 'shiva',
    titleEn: 'Mahamrityunjaya Mantra',
    titleHi: 'महामृत्युंजय मंत्र',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-vardhanam, Urvarukamiva Bandhanan Mrityor-mukshiya Maamritat',
    meaningEn: 'We worship the three-eyed Lord Shiva, the fragrant nourisher of all. May He free us from the bondage of death, like a ripe cucumber from its vine.',
    meaningHi: 'हम तीन नेत्रों वाले शिव की आराधना करते हैं। वे हमें मृत्यु के बंधन से मुक्त करें, जैसे ककड़ी अपने डंठल से मुक्त होती है।',
    benefitsEn: 'Wards off untimely death, heals chronic illness, removes fear and grants longevity.',
    benefitsHi: 'अकाल मृत्यु से बचाता है, रोग दूर करता है, भय हरता है, दीर्घायु देता है।',
    repetitions: 108,
    bestTime: { en: 'Pradosh Kaal (twilight), Mondays, Maha Shivratri', hi: 'प्रदोष काल, सोमवार, महाशिवरात्रि' },
  },
  {
    id: 'om-namah-shivaya',
    category: 'shiva',
    titleEn: 'Panchakshari Mantra',
    titleHi: 'पंचाक्षरी मंत्र',
    sanskrit: 'ॐ नमः शिवाय ॥',
    transliteration: 'Om Namah Shivaya',
    meaningEn: 'I bow to Lord Shiva — the auspicious one, source of all consciousness.',
    meaningHi: 'मैं शिव को नमन करता हूँ — कल्याणकारी, चेतना के स्रोत।',
    benefitsEn: 'Inner peace, dissolves ego, purifies mind, awakens spiritual energy.',
    benefitsHi: 'मानसिक शांति, अहंकार नाश, मन की शुद्धि, आध्यात्मिक जागृति।',
    repetitions: 108,
    bestTime: { en: 'Any time, especially Mondays and Brahma Muhurta', hi: 'किसी भी समय, विशेष सोमवार व ब्रह्म मुहूर्त' },
  },
  {
    id: 'ganesh-vakratunda',
    category: 'ganesh',
    titleEn: 'Vakratunda Mahakaya',
    titleHi: 'वक्रतुण्ड महाकाय',
    sanskrit: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥',
    transliteration: 'Vakratunda Mahakaya Surya-koti Samaprabha, Nirvighnam Kuru Me Deva Sarva-karyeshu Sarvada',
    meaningEn: 'O Lord with curved trunk and great body, radiant as a million suns, please remove all obstacles from my endeavors, always.',
    meaningHi: 'हे वक्र सूँडवाले, महाकाय, करोड़ों सूर्यों के समान तेजस्वी प्रभु — मेरे सभी कार्यों में सदा निर्विघ्नता प्रदान करें।',
    benefitsEn: 'Removes obstacles, ensures success in new ventures, brings wisdom.',
    benefitsHi: 'विघ्न दूर करता है, नए कार्यों में सफलता देता है, बुद्धि बढ़ाता है।',
    repetitions: 11,
    bestTime: { en: 'Before starting any new work, Wednesdays, Ganesh Chaturthi', hi: 'किसी भी नए कार्य से पहले, बुधवार, गणेश चतुर्थी' },
  },
  {
    id: 'hanuman-bal',
    category: 'hanuman',
    titleEn: 'Hanuman Bal Mantra',
    titleHi: 'हनुमान बल मंत्र',
    sanskrit: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् । वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥',
    transliteration: 'Manojavam Maruta-tulya-vegam, Jitendriyam Buddhimatam Varishtham, Vatatmajam Vanara-yutha-mukhyam, Shri-Rama-dutam Sharanam Prapadye',
    meaningEn: 'I take refuge in Hanuman — swift as mind, fast as wind, master of senses, foremost among the wise, son of wind god, chief of monkeys, and messenger of Lord Rama.',
    meaningHi: 'मन के समान तीव्र, वायु के समान वेगवान, इंद्रियों के विजेता, बुद्धिमानों में श्रेष्ठ, पवनपुत्र, वानरयूथपति, श्रीराम के दूत — हनुमान की शरण में मैं जाता हूँ।',
    benefitsEn: 'Removes fear, grants courage and strength, protection from negative energies.',
    benefitsHi: 'भय हरता है, साहस व बल देता है, नकारात्मक शक्तियों से रक्षा करता है।',
    repetitions: 11,
    bestTime: { en: 'Tuesdays and Saturdays, before exams or difficult tasks', hi: 'मंगल और शनिवार, परीक्षा या कठिन कार्य से पहले' },
  },
  {
    id: 'lakshmi',
    category: 'devi',
    titleEn: 'Lakshmi Mantra',
    titleHi: 'लक्ष्मी मंत्र',
    sanskrit: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः ॥',
    transliteration: 'Om Shreem Hreem Shreem Kamale Kamalalaye Praseed Praseed Shreem Hreem Shreem Om Mahalakshmyai Namah',
    meaningEn: 'O Goddess Lakshmi seated on the lotus, please bless me with prosperity, abundance and grace.',
    meaningHi: 'हे कमल पर विराजमान महालक्ष्मी देवी, मुझ पर धन, समृद्धि और कृपा की वर्षा करें।',
    benefitsEn: 'Attracts wealth, removes financial troubles, brings prosperity to home.',
    benefitsHi: 'धन आकर्षित करता है, आर्थिक कष्ट दूर करता है, घर में समृद्धि लाता है।',
    repetitions: 108,
    bestTime: { en: 'Fridays, Diwali, evening puja', hi: 'शुक्रवार, दीपावली, संध्या पूजा' },
  },
  {
    id: 'saraswati',
    category: 'devi',
    titleEn: 'Saraswati Vandana',
    titleHi: 'सरस्वती वंदना',
    sanskrit: 'या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता । या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना ॥',
    transliteration: 'Ya Kundendu Tushara-hara-dhavala, Ya Shubhra-vastravrita, Ya Veena-vara-danda-mandita-kara, Ya Shveta-padmasana',
    meaningEn: 'I bow to Goddess Saraswati, white as jasmine, moon and snow, draped in pure white, holding a veena, seated on a white lotus — goddess of wisdom and art.',
    meaningHi: 'जो कुन्द पुष्प, चंद्रमा और बर्फ़ के समान श्वेत हैं, श्वेत वस्त्र धारण किए हुए हैं, वीणा से सुशोभित हैं, श्वेत कमल पर विराजमान हैं — उन सरस्वती देवी को मेरा प्रणाम।',
    benefitsEn: 'Sharpens memory, helps students, enhances creativity and speech.',
    benefitsHi: 'स्मरण शक्ति बढ़ाता है, विद्यार्थियों के लिए श्रेष्ठ, रचनात्मकता और वाणी में निखार लाता है।',
    repetitions: 11,
    bestTime: { en: 'Mornings, Basant Panchami, before studies', hi: 'प्रातः काल, बसंत पंचमी, अध्ययन से पहले' },
  },
  {
    id: 'durga',
    category: 'devi',
    titleEn: 'Durga Mantra',
    titleHi: 'दुर्गा मंत्र',
    sanskrit: 'ॐ सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥',
    transliteration: 'Om Sarva-mangala Mangalye Shive Sarvartha-sadhike, Sharanye Tryambake Gauri Narayani Namostute',
    meaningEn: 'O auspicious one, giver of all welfare, fulfiller of every wish, refuge of all — three-eyed Gauri, Narayani — I bow to you.',
    meaningHi: 'हे सर्व मंगल की मूल, शिवे, सभी अर्थों को सिद्ध करने वाली, शरणागत वत्सला, त्रिनेत्रा गौरी, नारायणी — आपको मेरा प्रणाम।',
    benefitsEn: 'Protection from enemies, removes fear, grants strength and victory.',
    benefitsHi: 'शत्रुओं से रक्षा, भय का नाश, शक्ति और विजय प्रदान करता है।',
    repetitions: 108,
    bestTime: { en: 'Navratri, Tuesdays, Fridays', hi: 'नवरात्रि, मंगलवार, शुक्रवार' },
  },
  {
    id: 'krishna',
    category: 'vishnu',
    titleEn: 'Hare Krishna Mahamantra',
    titleHi: 'हरे कृष्ण महामंत्र',
    sanskrit: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे । हरे राम हरे राम राम राम हरे हरे ॥',
    transliteration: 'Hare Krishna Hare Krishna, Krishna Krishna Hare Hare, Hare Rama Hare Rama, Rama Rama Hare Hare',
    meaningEn: 'O divine energy of the Lord, O Krishna, O Rama — please engage me in your loving service.',
    meaningHi: 'हे भगवान की दिव्य शक्ति, हे कृष्ण, हे राम — मुझे अपनी प्रेममयी सेवा में लगाओ।',
    benefitsEn: 'Cleanses the mind, dissolves karma, brings devotion and bliss.',
    benefitsHi: 'मन की शुद्धि, कर्मों का नाश, भक्ति और आनंद देता है।',
    repetitions: 108,
    bestTime: { en: 'Any time — recommended in Kali Yuga', hi: 'किसी भी समय — कलियुग में विशेष फलदायी' },
  },
  {
    id: 'ram-mantra',
    category: 'vishnu',
    titleEn: 'Shri Ram Mantra',
    titleHi: 'श्री राम मंत्र',
    sanskrit: 'श्री राम जय राम जय जय राम ॥',
    transliteration: 'Shri Ram Jai Ram Jai Jai Ram',
    meaningEn: 'Victory to Lord Rama — the embodiment of truth, dharma and compassion.',
    meaningHi: 'श्री राम की जय हो — जो सत्य, धर्म और करुणा के स्वरूप हैं।',
    benefitsEn: 'Brings peace, removes mental turmoil, helpful at time of death.',
    benefitsHi: 'शांति देता है, मानसिक उद्वेग दूर करता है, अंत समय में सहायक है।',
    repetitions: 108,
    bestTime: { en: 'Any time, especially Ram Navami', hi: 'किसी भी समय, विशेष राम नवमी' },
  },
  {
    id: 'surya',
    category: 'navagraha',
    titleEn: 'Surya (Sun) Mantra',
    titleHi: 'सूर्य मंत्र',
    sanskrit: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥',
    transliteration: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
    meaningEn: 'I bow to Lord Surya, the radiant Sun god, source of all life and energy.',
    meaningHi: 'मैं सूर्य देव को नमन करता हूँ — जीवन और ऊर्जा के स्रोत।',
    benefitsEn: 'Strengthens Sun in birth chart, brings fame, leadership, vitality.',
    benefitsHi: 'कुण्डली में सूर्य बल बढ़ाता है, यश, नेतृत्व, ओज देता है।',
    repetitions: 7,
    bestTime: { en: 'Sunday mornings during sunrise (Arghya)', hi: 'रविवार सुबह सूर्योदय (अर्घ्य) समय' },
  },
  {
    id: 'shanti',
    category: 'peace',
    titleEn: 'Universal Peace Mantra',
    titleHi: 'सर्वे भवन्तु सुखिनः',
    sanskrit: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥ ॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'Sarve Bhavantu Sukhinah, Sarve Santu Niramayah, Sarve Bhadrani Pashyantu, Ma Kashchit Duhkha Bhag-bhavet. Om Shantih Shantih Shantih',
    meaningEn: 'May all beings be happy, may all be free from illness, may all see what is auspicious, may no one suffer. Peace, peace, peace.',
    meaningHi: 'सभी प्राणी सुखी हों, सभी निरोगी हों, सभी मंगल देखें, कोई दुःखी न हो। शांति, शांति, शांति।',
    benefitsEn: 'Spreads goodwill, calms mind, promotes universal harmony.',
    benefitsHi: 'सद्भाव फैलाता है, मन शांत करता है, सार्वभौमिक सामंजस्य लाता है।',
    repetitions: 3,
    bestTime: { en: 'Before/after meditation, end of any prayer', hi: 'ध्यान से पहले/बाद, किसी भी प्रार्थना के अंत में' },
  },
];
