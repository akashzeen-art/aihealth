/**
 * Answers greetings, thanks and clearly non-health requests locally so they never
 * reach the paid AI API. Anything with a health word is always passed through.
 */

type Lang = 'en' | 'hi' | 'fr' | 'sw' | 'ar'

const GREETING =
  /^(hi+|hello+|hey+|hii+|helo|namaste|namaskar|good (morning|afternoon|evening)|नमस्ते|नमस्कार|हेलो|हाय|salam|salaam|assalam ?o? ?alaikum|bonjour|salut|habari|jambo|مرحبا|السلام عليكم)[\s!.,?🙏]*$/i

const THANKS =
  /^(thanks?( you)?|thank u|thx|ty|dhanyavaa?d|shukriya|धन्यवाद|शुक्रिया|merci|asante|شكرا|ok(ay)?|okk+|done|great|nice|cool|👍)[\s!.,?]*$/i

const OFF_TOPIC = new RegExp(
  [
    '\\b(code|coding|program(ming)?|python|javascript|java|html|css|sql|react|website|app develop)',
    '\\b(essay|poem|poetry|shayari|story|kahani|joke|jokes|chutkul|riddle|song|lyrics|gaana)',
    '\\b(movie|film|web ?series|netflix|actor|actress|bollywood|cricket|ipl|football|match|score)',
    '\\b(stock|share market|sensex|crypto|bitcoin|trading|loan|investment)',
    '\\b(politic|election|minister|government|news)',
    '\\b(homework|assignment|maths?|equation|algebra|physics|chemistry|history|geography|capital of)',
    '\\b(horoscope|rashifal|kundli|astrology|girlfriend|boyfriend|love letter|pubg|free ?fire|bgmi|game)',
    '\\bwrite (an? )?(email|letter|application|essay|story|poem|caption|bio)',
    'कहानी|कविता|चुटकुला|फिल्म|क्रिकेट|राजनीति|गाना',
  ].join('|'),
  'i',
)

const HEALTH =
  /health|pain|ache|fever|cough|\bcold\b|\bflu\b|sugar|diabet|\bbp\b|blood pressure|pregnan|period|baby|child|\bkids?\b|vaccin|medicin|tablet|\bdose|doctor|hospital|clinic|\bdiet|\bfood|\beat(ing)?\b|\bmeals?\b|weight|sleep|stress|anxi|depress|\bmood|\bskin|\bhair\b|rash|headache|stomach|vomit|diarrh|injur|\bburns?\b|\bcuts?\b|wound|bleed|exercise|workout|yoga|heart|breath|allerg|\breports?\b|blood|symptom|remed|nuskh|sehat|dard|bukhar|khansi|dawa|ilaj|\bbody\b|bimar|\bsick|\bill(ness)?\b|infection|virus|nutrition|vitamin|protein|calorie|thyroid|asthma|cancer|tooth|teeth|\beyes?\b|\bears?\b|throat|\bnose\b|sports injury|\bchot|ghutn|kamar|\bmoch\b|sujan|soojan|jukam|zukam|\bulti\b|\bdast\b|kamzori|thakan|chakkar|khujli|\bdaant|aankh|\bkaan\b|\bgala\b|\bpet\b|\bsir ?dard|\bpair\b|haddi|\bnas\b|saans|pasina|gharelu|upchar|\bjalan|\bkhoon|\bdabav|मोच|सूजन|उल्टी|दस्त|कमज़ोरी|कमजोरी|थकान|चक्कर|खुजली|दांत|आंख|कान|गला|घुटन|कमर|हड्डी|सांस|चोट|बुखार|दर्द|खांसी|जुकाम|दवा|स्वास्थ्य|सेहत|डॉक्टर|पेट|सिर|बीमार|इलाज|नुस्खा|खाना|वजन|नींद|तनाव|गर्भ|बच्च/i

const COPY: Record<Lang, { greeting: string; thanks: string; offTopic: (name: string) => string }> = {
  en: {
    greeting: 'Hello! 👋 Ask me any health question.',
    thanks: "You're welcome! 😊 Ask anytime you have another health question.",
    offTopic: (name) =>
      `I'm the ${name} and can only help with health questions. 🩺 Try asking about symptoms, home remedies, diet or medicines.`,
  },
  hi: {
    greeting: 'नमस्ते! 👋 सेहत से जुड़ा कोई भी सवाल पूछें — लक्षण, घरेलू नुस्खे, खान-पान या दवाइयाँ।',
    thanks: 'आपका स्वागत है! 😊 सेहत से जुड़ा कोई और सवाल हो तो ज़रूर पूछें।',
    offTopic: (name) =>
      `मैं ${name} हूँ और सिर्फ़ सेहत से जुड़े सवालों में मदद कर सकता हूँ। 🩺 लक्षण, घरेलू नुस्खे, खान-पान या दवाइयों के बारे में पूछें।`,
  },
  fr: {
    greeting: 'Bonjour ! 👋 Posez-moi une question de santé — symptômes, remèdes maison, alimentation ou médicaments.',
    thanks: 'Avec plaisir ! 😊 Revenez quand vous avez une autre question de santé.',
    offTopic: (name) =>
      `Je suis ${name} et je ne peux aider qu'avec des questions de santé. 🩺 Demandez-moi des symptômes, remèdes maison, alimentation ou médicaments.`,
  },
  sw: {
    greeting: 'Habari! 👋 Niulize swali lolote la afya — dalili, tiba za nyumbani, lishe au dawa.',
    thanks: 'Karibu! 😊 Uliza wakati wowote una swali lingine la afya.',
    offTopic: (name) =>
      `Mimi ni ${name} na ninaweza kusaidia tu na maswali ya afya. 🩺 Uliza kuhusu dalili, tiba za nyumbani, lishe au dawa.`,
  },
  ar: {
    greeting: 'مرحبًا! 👋 اسألني أي سؤال صحي — الأعراض، العلاجات المنزلية، الغذاء أو الأدوية.',
    thanks: 'على الرحب والسعة! 😊 اسأل في أي وقت عن أي سؤال صحي آخر.',
    offTopic: (name) =>
      `أنا ${name} ويمكنني المساعدة في الأسئلة الصحية فقط. 🩺 اسأل عن الأعراض أو العلاجات المنزلية أو الغذاء أو الأدوية.`,
  },
}

function toLang(language?: string): Lang {
  const code = (language || 'en').slice(0, 2).toLowerCase()
  return (['en', 'hi', 'fr', 'sw', 'ar'] as const).includes(code as Lang) ? (code as Lang) : 'en'
}

export function localReply(
  message: string,
  language: string | undefined,
  assistantName: string,
  offer?: string | null,
): string | null {
  const text = message.trim()
  if (!text) return null
  const lang = toLang(language)
  const copy = COPY[lang]
  if (GREETING.test(text)) {
    return lang === 'en' && offer ? `Hello! 👋 I'm the **${assistantName}**. ${offer}` : copy.greeting
  }
  if (THANKS.test(text)) return copy.thanks
  if (OFF_TOPIC.test(text) && !HEALTH.test(text)) return copy.offTopic(assistantName)
  return null
}
