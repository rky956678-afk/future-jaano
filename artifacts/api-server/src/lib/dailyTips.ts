// Server-side copy of curated daily life tips. Kept in sync with
// `artifacts/future-jaano/src/lib/dailyTips.ts`. Picked deterministically
// by IST day-of-year so the same tip goes out to everyone on the same day.

export interface DailyTip {
  category: string;
  titleEn: string;
  titleHi: string;
  messageEn: string;
  messageHi: string;
}

const TIPS: DailyTip[] = [
  { category: 'lakshmi', titleEn: '💰 Wake up before sunrise', titleHi: '💰 सूर्योदय से पहले उठें', messageEn: "Lakshmi visits homes where people are awake before sunrise. Just 15 minutes earlier each day brings clarity and saves you money on impulse decisions.", messageHi: "जिस घर में लोग सूर्योदय से पहले जागते हैं, वहाँ माँ लक्ष्मी ज़रूर आती हैं। रोज़ 15 मिनट पहले उठने से मन शांत रहेगा और बेकार के खर्च नहीं होंगे।" },
  { category: 'money', titleEn: '🪙 The 24-hour rule', titleHi: '🪙 24 घंटे का नियम', messageEn: "Before any purchase above ₹500 today, wait 24 hours. 7 out of 10 times you won't want it tomorrow. Saved money is earned money.", messageHi: "आज ₹500 से ऊपर की कोई भी चीज़ खरीदने से पहले 24 घंटे रुकें। 10 में से 7 बार कल आपको वो चीज़ नहीं चाहिए होगी। बचाया हुआ पैसा कमाया हुआ पैसा है।" },
  { category: 'vastu', titleEn: '🧹 Clean the north-east corner', titleHi: '🧹 ईशान कोण साफ़ रखें', messageEn: "The north-east corner of your home is the wealth corner. Keep it clutter-free today and place a small water bowl there — wealth flow improves within weeks.", messageHi: "घर का ईशान कोण (उत्तर-पूर्व) धन का कोना है। आज इसे साफ़ कर के एक छोटा जल पात्र रखें — कुछ ही हफ्तों में धन की गति बढ़ेगी।" },
  { category: 'money', titleEn: '📒 Note every rupee today', titleHi: '📒 आज हर रुपया लिखें', messageEn: "Write down every single expense today, even ₹10. Awareness alone cuts spending by 20% — without changing anything else.", messageHi: "आज हर एक खर्च लिख लें — ₹10 भी। सिर्फ जागरूकता से ही खर्च 20% कम हो जाता है, कुछ और बदले बिना।" },
  { category: 'lakshmi', titleEn: '🪔 Light a diya in the evening', titleHi: '🪔 शाम को दीपक जलाएँ', messageEn: "Light a mustard-oil diya at your home entrance at dusk. This simple act welcomes Lakshmi and removes financial obstacles.", messageHi: "शाम के समय घर के मुख्य द्वार पर सरसों के तेल का दीपक जलाएँ। यह सरल उपाय माँ लक्ष्मी को आमंत्रित करता है और आर्थिक बाधाएँ दूर करता है।" },
  { category: 'wisdom', titleEn: '🤝 Help someone before noon', titleHi: '🤝 दोपहर से पहले किसी की मदद करें', messageEn: "Lal Kitab says help given before noon returns 7-fold. A small act today — even sharing knowledge — multiplies your fortune.", messageHi: "लाल किताब के अनुसार दोपहर से पहले की गई मदद 7 गुना होकर लौटती है। आज एक छोटा-सा सहयोग भी — चाहे ज्ञान बाँटना ही क्यों न हो — आपके भाग्य को कई गुना बढ़ाएगा।" },
  { category: 'health', titleEn: '🥛 Drink warm water on empty stomach', titleHi: '🥛 खाली पेट गर्म पानी पिएँ', messageEn: "Start the day with warm water + a pinch of turmeric. Save thousands on future medical bills with this 1-rupee daily habit.", messageHi: "दिन की शुरुआत गर्म पानी और चुटकी भर हल्दी से करें। यह 1 रुपये की आदत भविष्य के हजारों रुपये के दवाई के खर्च बचा देती है।" },
  { category: 'money', titleEn: '💳 Use cash today, not card', titleHi: '💳 आज कैश इस्तेमाल करें, कार्ड नहीं', messageEn: "Studies show people spend 30% less when paying with cash. Try it for just one day and see the difference in your wallet.", messageHi: "रिसर्च बताती है कि कैश से खर्च 30% कम होता है UPI/कार्ड के मुक़ाबले। बस एक दिन ट्राय करें और जेब में फ़र्क महसूस करें।" },
  { category: 'vastu', titleEn: "💧 Don't leave taps dripping", titleHi: '💧 नल टपकने न दें', messageEn: "A dripping tap drains your savings — Vastu links flowing water leaks to leaking finances. Fix it today before sunset.", messageHi: "टपकता हुआ नल आपकी बचत बहा देता है — वास्तु में पानी का रिसाव धन के रिसाव से जुड़ा है। सूर्यास्त से पहले आज ही ठीक करवाएँ।" },
  { category: 'lakshmi', titleEn: '🌿 Tulsi water at sunrise', titleHi: '🌿 सूर्योदय पर तुलसी जल', messageEn: "Offer water to Tulsi at sunrise and circle it 7 times. This invites Maa Lakshmi into your home and stabilizes income.", messageHi: "सूर्योदय पर तुलसी को जल चढ़ाएँ और 7 परिक्रमा करें। यह माँ लक्ष्मी को घर में बुलाता है और आय को स्थिर करता है।" },
  { category: 'money', titleEn: '🍱 Carry lunch from home', titleHi: '🍱 घर से खाना ले जाएँ', messageEn: "Eating out twice a week costs ₹2000+ a month. Carry lunch today — save ₹24,000 a year, eat healthier, and feel lighter.", messageHi: "हफ्ते में 2 बार बाहर खाने से ₹2000+ का खर्च होता है। आज घर से खाना ले जाएँ — साल के ₹24,000 बचेंगे, सेहत भी अच्छी रहेगी।" },
  { category: 'wisdom', titleEn: '🗣️ Speak only good in the morning', titleHi: '🗣️ सुबह केवल अच्छा बोलें', messageEn: "What you speak in the first hour of the day shapes your whole day's energy. Avoid complaints and gossip until noon — watch your luck shift.", messageHi: "दिन के पहले घंटे में जो आप बोलते हैं, वही पूरे दिन की ऊर्जा बनती है। दोपहर तक शिकायत और चुगली से बचें — देखिए कैसे किस्मत बदलती है।" },
  { category: 'vastu', titleEn: '🚪 Keep main door clean & bright', titleHi: '🚪 मुख्य द्वार साफ़ और रोशन रखें', messageEn: "Wipe your main door today. A clean, well-lit entrance invites prosperity — a dirty one blocks Lakshmi from entering your home.", messageHi: "आज अपने मुख्य द्वार को पोंछें। साफ़ और रोशन प्रवेश द्वार समृद्धि को बुलाता है — गंदा द्वार माँ लक्ष्मी को घर में आने से रोकता है।" },
  { category: 'money', titleEn: '📱 Cancel one unused subscription', titleHi: '📱 एक बेकार सब्सक्रिप्शन बंद करें', messageEn: "Check your phone today — which subscription have you not used in 30 days? Cancel it now. Average Indian wastes ₹3,500/year on unused apps.", messageHi: "आज अपना फ़ोन देखें — कौन सी सब्सक्रिप्शन 30 दिनों से इस्तेमाल नहीं की? अभी बंद करें। आम भारतीय हर साल ₹3,500 बेकार ऐप्स पर बर्बाद करता है।" },
  { category: 'lakshmi', titleEn: '🪙 Donate 1 rupee today', titleHi: '🪙 आज 1 रुपया दान करें', messageEn: "Even ₹1 given selflessly today opens 100 doors of fortune. Charity isn't about the amount — it's about the intention.", messageHi: "आज निःस्वार्थ भाव से दिया गया ₹1 भी भाग्य के 100 द्वार खोल देता है। दान राशि से नहीं, भावना से होता है।" },
  { category: 'health', titleEn: '🚶 Walk 20 minutes today', titleHi: '🚶 आज 20 मिनट टहलें', messageEn: "A 20-minute morning walk saves an average of ₹50,000/year in future health costs. Free medicine — start today.", messageHi: "रोज़ 20 मिनट की सुबह की सैर औसतन ₹50,000/साल की भविष्य की स्वास्थ्य लागत बचाती है। मुफ्त की दवा है — आज से शुरू करें।" },
  { category: 'vastu', titleEn: '🧂 Salt water mop on Saturdays', titleHi: '🧂 शनिवार को नमक के पानी से पोंछा', messageEn: "Mop your floors with rock salt water on Saturdays. It removes negative energy that blocks money flow into your home.", messageHi: "शनिवार को सेंधा नमक के पानी से फर्श पर पोंछा लगाएँ। यह उस नकारात्मक ऊर्जा को हटाता है जो घर में धन के आगमन को रोकती है।" },
  { category: 'wisdom', titleEn: '🧘 5 minutes of silence', titleHi: '🧘 5 मिनट की चुप्पी', messageEn: "Sit in complete silence for 5 minutes after waking. Decisions made from a calm mind save more money than any budget app.", messageHi: "जागने के बाद 5 मिनट पूरी तरह चुप बैठें। शांत मन से लिए गए निर्णय किसी भी बजट ऐप से ज़्यादा पैसा बचाते हैं।" },
  { category: 'money', titleEn: '🛒 Make a list before shopping', titleHi: '🛒 खरीदारी से पहले सूची बनाएँ', messageEn: "Never enter a store without a written list. People buy 40% more without one. Today's list is tomorrow's savings.", messageHi: "लिखित सूची के बिना कभी दुकान में न जाएँ। बिना सूची लोग 40% ज़्यादा खरीदते हैं। आज की सूची कल की बचत है।" },
  { category: 'lakshmi', titleEn: '✋ Look at your palms first', titleHi: '✋ सबसे पहले अपनी हथेलियाँ देखें', messageEn: "Right after waking, look at both palms and recite 'Karagre Vasate Lakshmi'. This ancient practice channels prosperity through the day.", messageHi: "जागते ही सबसे पहले अपनी दोनों हथेलियाँ देखें और 'कराग्रे वसते लक्ष्मी' का जाप करें। यह प्राचीन अभ्यास पूरे दिन समृद्धि को आकर्षित करता है।" },
  { category: 'vastu', titleEn: '🌱 Place a money plant in south-east', titleHi: '🌱 दक्षिण-पूर्व में मनी प्लांट रखें', messageEn: "A money plant in the south-east (Agneya) corner of your home grows wealth. Water it today and feel the shift.", messageHi: "घर के दक्षिण-पूर्व (आग्नेय) कोण में मनी प्लांट धन को बढ़ाता है। आज इसे पानी दें और परिवर्तन महसूस करें।" },
  { category: 'money', titleEn: '🍵 Skip one coffee shop visit', titleHi: '🍵 एक कैफ़े विज़िट छोड़ें', messageEn: "₹200 saved daily on outside chai/coffee = ₹73,000 a year. Make it at home today. Your wallet will thank you in 365 days.", messageHi: "रोज़ बाहर की चाय/कॉफ़ी पर ₹200 बचाएँ = साल के ₹73,000। आज घर पर बनाएँ। 365 दिन बाद आपकी जेब आपको धन्यवाद देगी।" },
  { category: 'wisdom', titleEn: "🙏 Touch parents' feet today", titleHi: '🙏 आज माता-पिता के पैर छुएँ', messageEn: "Their blessing this morning removes 9 planetary doshas at once. No remedy is stronger. No money can buy this protection.", messageHi: "आज सुबह उनका आशीर्वाद एक साथ 9 ग्रह दोषों को दूर करता है। इससे शक्तिशाली कोई उपाय नहीं। यह सुरक्षा कोई पैसा नहीं खरीद सकता।" },
  { category: 'lakshmi', titleEn: '🌾 Feed birds in the morning', titleHi: '🌾 सुबह पक्षियों को दाना डालें', messageEn: "A small bowl of grains for birds today removes Pitra dosha and opens new income paths. Cost: ₹5. Returns: priceless.", messageHi: "आज पक्षियों के लिए एक छोटा कटोरा अनाज पितृ दोष को दूर करता है और आय के नए रास्ते खोलता है। खर्च: ₹5। मिलेगा: अनमोल।" },
  { category: 'health', titleEn: '🛏️ Sleep before 11 PM tonight', titleHi: '🛏️ आज रात 11 बजे से पहले सोएँ', messageEn: "Sleeping before 11 PM heals the body for free. Late sleep = future medical bills + low energy + poor money decisions.", messageHi: "रात 11 बजे से पहले सोना शरीर को मुफ़्त में ठीक करता है। देर से सोना = भविष्य के मेडिकल खर्च + कम ऊर्जा + खराब आर्थिक निर्णय।" },
  { category: 'money', titleEn: '💼 Negotiate one bill this week', titleHi: '💼 इस हफ्ते एक बिल पर मोलभाव करें', messageEn: "Call your internet/mobile/insurance provider today. 8 out of 10 times they will lower your bill if you simply ask. 5 minutes, ₹500+ saved.", messageHi: "आज अपने इंटरनेट/मोबाइल/इंश्योरेंस वाले को कॉल करें। 10 में से 8 बार वो बिल कम कर देते हैं — बस माँगना है। 5 मिनट, ₹500+ की बचत।" },
  { category: 'vastu', titleEn: '🪞 Mirror facing your safe/locker', titleHi: '🪞 तिजोरी के सामने आईना', messageEn: "Place a mirror facing your money locker or wallet drawer. It doubles the wealth energy according to Vastu Shastra.", messageHi: "अपनी तिजोरी या वॉलेट वाले दराज के सामने आईना रखें। वास्तु शास्त्र के अनुसार यह धन की ऊर्जा को दोगुना करता है।" },
  { category: 'wisdom', titleEn: '📚 Learn one new skill — free', titleHi: '📚 एक नया कौशल सीखें — मुफ्त', messageEn: "Spend 30 minutes today learning a free skill on YouTube. The skill you learn this month earns money for the next 30 years.", messageHi: "आज YouTube पर 30 मिनट एक नया कौशल सीखें। इस महीने सीखा हुआ कौशल अगले 30 साल तक पैसा कमाता है।" },
  { category: 'lakshmi', titleEn: '🪙 Keep a silver coin in wallet', titleHi: '🪙 वॉलेट में चांदी का सिक्का रखें', messageEn: "A small silver coin in your wallet attracts Lakshmi continuously. It's a one-time ₹100 spend that compounds your wealth daily.", messageHi: "वॉलेट में एक छोटा चांदी का सिक्का रखें — यह माँ लक्ष्मी को निरंतर आकर्षित करता है। एक बार का ₹100 खर्च जो रोज़ धन बढ़ाता है।" },
  { category: 'money', titleEn: '🔌 Switch off standby today', titleHi: '🔌 आज स्टैंडबाय बंद करें', messageEn: "TV, microwave, geyser on standby silently eat ₹300-500/month. Switch off at the plug today. Free money found.", messageHi: "टीवी, माइक्रोवेव, गीज़र स्टैंडबाय पर चुपचाप ₹300-500/महीना खा जाते हैं। आज प्लग से बंद करें। मुफ्त का पैसा मिल गया।" },
];

function istDayOfYear(): number {
  // IST = UTC+5:30. Compute current day-of-year in IST so the rotation
  // aligns with users' local mornings.
  const now = new Date();
  const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
  const ist = new Date(istMs);
  const start = Date.UTC(ist.getUTCFullYear(), 0, 0);
  const diff = ist.getTime() - start;
  return Math.floor(diff / 86400000);
}

export function getTodayTip(): DailyTip {
  const idx = istDayOfYear() % TIPS.length;
  return TIPS[idx]!;
}

export function getTipForLang(tip: DailyTip, lang: string): { title: string; message: string } {
  const isHi = lang !== 'en';
  return {
    title: isHi ? tip.titleHi : tip.titleEn,
    message: isHi ? tip.messageHi : tip.messageEn,
  };
}
