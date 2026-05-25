export type FestivalType = 'hindu' | 'muslim' | 'sikh' | 'jain' | 'christian' | 'national' | 'regional';

export interface Festival {
  date: string;
  nameEn: string;
  nameHi: string;
  type: FestivalType;
  gazetted?: boolean;
}

export const FESTIVALS_2026: Festival[] = [
  { date: '2026-01-01', nameEn: "New Year's Day", nameHi: 'नव वर्ष', type: 'national' },
  { date: '2026-01-04', nameEn: 'Guru Gobind Singh Jayanti', nameHi: 'गुरु गोबिंद सिंह जयंती', type: 'sikh' },
  { date: '2026-01-14', nameEn: 'Makar Sankranti / Pongal', nameHi: 'मकर संक्रांति / पोंगल', type: 'hindu', gazetted: true },
  { date: '2026-01-15', nameEn: 'Lohri', nameHi: 'लोहड़ी', type: 'regional' },
  { date: '2026-01-23', nameEn: 'Subhash Chandra Bose Jayanti', nameHi: 'सुभाष चंद्र बोस जयंती', type: 'national' },
  { date: '2026-01-25', nameEn: 'Vasant Panchami', nameHi: 'वसंत पंचमी', type: 'hindu' },
  { date: '2026-01-26', nameEn: 'Republic Day', nameHi: 'गणतंत्र दिवस', type: 'national', gazetted: true },

  { date: '2026-02-15', nameEn: 'Maha Shivratri', nameHi: 'महाशिवरात्रि', type: 'hindu', gazetted: true },
  { date: '2026-02-17', nameEn: 'Shab-e-Barat', nameHi: 'शब-ए-बारात', type: 'muslim' },

  { date: '2026-03-03', nameEn: 'Holika Dahan', nameHi: 'होलिका दहन', type: 'hindu' },
  { date: '2026-03-04', nameEn: 'Holi', nameHi: 'होली', type: 'hindu', gazetted: true },
  { date: '2026-03-19', nameEn: 'Ramadan Begins', nameHi: 'रमज़ान शुरू', type: 'muslim' },
  { date: '2026-03-19', nameEn: 'Chaitra Navratri Begins', nameHi: 'चैत्र नवरात्रि प्रारंभ', type: 'hindu' },
  { date: '2026-03-27', nameEn: 'Ram Navami', nameHi: 'राम नवमी', type: 'hindu', gazetted: true },
  { date: '2026-03-31', nameEn: 'Mahavir Jayanti', nameHi: 'महावीर जयंती', type: 'jain', gazetted: true },

  { date: '2026-04-02', nameEn: 'Good Friday', nameHi: 'गुड फ्राइडे', type: 'christian', gazetted: true },
  { date: '2026-04-04', nameEn: 'Easter Sunday', nameHi: 'ईस्टर', type: 'christian' },
  { date: '2026-04-14', nameEn: 'Ambedkar Jayanti / Baisakhi', nameHi: 'अंबेडकर जयंती / बैसाखी', type: 'national', gazetted: true },
  { date: '2026-04-18', nameEn: 'Eid-ul-Fitr', nameHi: 'ईद-उल-फ़ितर', type: 'muslim', gazetted: true },

  { date: '2026-05-01', nameEn: 'Labour Day', nameHi: 'मजदूर दिवस', type: 'national' },
  { date: '2026-05-01', nameEn: 'Akshaya Tritiya', nameHi: 'अक्षय तृतीया', type: 'hindu' },
  { date: '2026-05-21', nameEn: 'Buddha Purnima', nameHi: 'बुद्ध पूर्णिमा', type: 'hindu', gazetted: true },

  { date: '2026-06-25', nameEn: 'Jagannath Rath Yatra', nameHi: 'जगन्नाथ रथ यात्रा', type: 'hindu' },
  { date: '2026-06-26', nameEn: 'Eid-ul-Zuha (Bakrid)', nameHi: 'ईद-उल-ज़ुहा (बकरीद)', type: 'muslim', gazetted: true },

  { date: '2026-07-26', nameEn: 'Muharram (Ashura)', nameHi: 'मुहर्रम', type: 'muslim', gazetted: true },
  { date: '2026-07-29', nameEn: 'Hariyali Teej', nameHi: 'हरियाली तीज', type: 'hindu' },

  { date: '2026-08-09', nameEn: 'Nag Panchami', nameHi: 'नाग पंचमी', type: 'hindu' },
  { date: '2026-08-15', nameEn: 'Independence Day', nameHi: 'स्वतंत्रता दिवस', type: 'national', gazetted: true },
  { date: '2026-08-15', nameEn: 'Parsi New Year', nameHi: 'पारसी नव वर्ष', type: 'regional' },
  { date: '2026-08-19', nameEn: 'Janmashtami', nameHi: 'जन्माष्टमी', type: 'hindu', gazetted: true },
  { date: '2026-08-28', nameEn: 'Raksha Bandhan', nameHi: 'रक्षाबंधन', type: 'hindu' },

  { date: '2026-09-04', nameEn: 'Ganesh Chaturthi', nameHi: 'गणेश चतुर्थी', type: 'hindu' },
  { date: '2026-09-05', nameEn: 'Onam', nameHi: 'ओणम', type: 'regional' },
  { date: '2026-09-25', nameEn: 'Eid-e-Milad (Mawlid)', nameHi: 'ईद-ए-मिलाद', type: 'muslim', gazetted: true },

  { date: '2026-10-02', nameEn: 'Gandhi Jayanti', nameHi: 'गांधी जयंती', type: 'national', gazetted: true },
  { date: '2026-10-11', nameEn: 'Sharad Navratri Begins', nameHi: 'शारदीय नवरात्रि प्रारंभ', type: 'hindu' },
  { date: '2026-10-19', nameEn: 'Durga Ashtami', nameHi: 'दुर्गा अष्टमी', type: 'hindu' },
  { date: '2026-10-20', nameEn: 'Maha Navami', nameHi: 'महानवमी', type: 'hindu' },
  { date: '2026-10-21', nameEn: 'Dussehra (Vijayadashami)', nameHi: 'दशहरा (विजयदशमी)', type: 'hindu', gazetted: true },
  { date: '2026-10-27', nameEn: 'Karva Chauth', nameHi: 'करवा चौथ', type: 'hindu' },

  { date: '2026-11-08', nameEn: 'Dhanteras', nameHi: 'धनतेरस', type: 'hindu' },
  { date: '2026-11-09', nameEn: 'Choti Diwali (Narak Chaturdashi)', nameHi: 'छोटी दिवाली (नरक चतुर्दशी)', type: 'hindu' },
  { date: '2026-11-10', nameEn: 'Diwali (Lakshmi Puja)', nameHi: 'दिवाली (लक्ष्मी पूजा)', type: 'hindu', gazetted: true },
  { date: '2026-11-11', nameEn: 'Govardhan Puja', nameHi: 'गोवर्धन पूजा', type: 'hindu' },
  { date: '2026-11-12', nameEn: 'Bhai Dooj', nameHi: 'भाई दूज', type: 'hindu' },
  { date: '2026-11-16', nameEn: 'Chhath Puja', nameHi: 'छठ पूजा', type: 'hindu' },
  { date: '2026-11-24', nameEn: 'Guru Tegh Bahadur Martyrdom Day', nameHi: 'गुरु तेग बहादुर शहीदी दिवस', type: 'sikh' },
  { date: '2026-11-24', nameEn: 'Guru Nanak Jayanti', nameHi: 'गुरु नानक जयंती', type: 'sikh', gazetted: true },

  { date: '2026-12-25', nameEn: 'Christmas Day', nameHi: 'क्रिसमस', type: 'christian', gazetted: true },
];

export const TYPE_LABEL: Record<FestivalType, { en: string; hi: string }> = {
  hindu: { en: 'Hindu', hi: 'हिन्दू' },
  muslim: { en: 'Muslim', hi: 'मुस्लिम' },
  sikh: { en: 'Sikh', hi: 'सिख' },
  jain: { en: 'Jain', hi: 'जैन' },
  christian: { en: 'Christian', hi: 'ईसाई' },
  national: { en: 'National', hi: 'राष्ट्रीय' },
  regional: { en: 'Regional', hi: 'क्षेत्रीय' },
};

export const TYPE_COLOR: Record<FestivalType, string> = {
  hindu: 'bg-orange-500/20 text-orange-200 border-orange-500/40',
  muslim: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  sikh: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
  jain: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
  christian: 'bg-red-500/20 text-red-200 border-red-500/40',
  national: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
  regional: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
};

export function festivalsForMonth(year: number, monthIndex: number): Festival[] {
  const ym = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return FESTIVALS_2026.filter(f => f.date.startsWith(ym));
}

export function festivalsForDate(dateStr: string): Festival[] {
  return FESTIVALS_2026.filter(f => f.date === dateStr);
}
