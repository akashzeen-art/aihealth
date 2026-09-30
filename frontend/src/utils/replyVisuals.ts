type VisualRule = { icon: string; tone: string; test: RegExp }

const RULES: VisualRule[] = [
  { icon: '🚑', tone: 'red', test: /emergenc|ambulance|\b(108|112|911|999)\b|call (for )?help|आपात|एम्बुलेंस/i },
  { icon: '❓', tone: 'indigo', test: /question|\bask\b|पूछ|सवाल/i },
  { icon: '📄', tone: 'blue', test: /document|record|report|referral|prescription|photo|insurance|रिपोर्ट/i },
  { icon: '📝', tone: 'amber', test: /timeline|diary|journal|note down|लिख/i },
  { icon: '🍯', tone: 'amber', test: /honey|shahad|शहद/i },
  { icon: '🫚', tone: 'amber', test: /ginger|adrak|अदरक|सोंठ/i },
  { icon: '🌿', tone: 'green', test: /tulsi|basil|mint|pudina|neem|herb|kadha|काढ़ा|तुलसी|पुदीना/i },
  { icon: '🥛', tone: 'amber', test: /haldi|turmeric|हल्दी|milk|doodh|दूध/i },
  { icon: '♨️', tone: 'orange', test: /steam|bhaap|भाप|warm compress|hot compress|सिकाई/i },
  { icon: '🧂', tone: 'blue', test: /gargle|salt water|namak|नमक|गरारे/i },
  { icon: '🍋', tone: 'amber', test: /lemon|nimbu|नींबू/i },
  { icon: '🌱', tone: 'green', test: /ajwain|jeera|cumin|saunf|fennel|methi|isabgol|psyllium|अजवाइन|जीरा|सौंफ|ईसबगोल/i },
  { icon: '🥥', tone: 'teal', test: /coconut|nariyal|नारियल/i },
  { icon: '🥣', tone: 'teal', test: /curd|yogurt|dahi|buttermilk|chaach|दही|छाछ/i },
  { icon: '🍌', tone: 'amber', test: /banana|kela|केला/i },
  { icon: '🫁', tone: 'red', test: /breath|wheez|सांस|श्वास/i },
  { icon: '🌡️', tone: 'orange', test: /fever|temperature|thermometer|°[cf]|बुखार|तापमान|ताप/i },
  { icon: '💧', tone: 'blue', test: /water|fluid|hydrat|drink|\bors\b|dehydrat|coconut|soup|पानी|तरल|पेय/i },
  { icon: '😴', tone: 'indigo', test: /\brest\b|sleep|nap|drows|आराम|नींद/i },
  { icon: '👕', tone: 'teal', test: /cloth|dress|wear|layer|blanket|कपड़|पहना/i },
  { icon: '💉', tone: 'blue', test: /vaccin|immuni|injection|टीका|टीके/i },
  { icon: '💊', tone: 'violet', test: /medicin|tablet|syrup|paracetamol|ibuprofen|dose|drug|pill|दवा|दवाई|खुराक/i },
  { icon: '🩺', tone: 'teal', test: /doctor|clinician|paediatric|pediatric|hospital|clinic|check-?up|डॉक्टर|चिकित्सक|अस्पताल/i },
  { icon: '🤢', tone: 'green', test: /vomit|nause|diarrh|loose motion|उल्टी|दस्त|मतली/i },
  { icon: '🩹', tone: 'pink', test: /rash|skin|wound|cut|burn|bleed|चकत्त|त्वचा|घाव|खून/i },
  { icon: '🩸', tone: 'red', test: /sugar|glucose|diabet|insulin|शुगर|मधुमेह/i },
  { icon: '❤️', tone: 'red', test: /blood pressure|\bbp\b|heart|pulse|रक्तचाप|दिल/i },
  { icon: '🧠', tone: 'violet', test: /stress|anxi|mood|mental|calm|worr|तनाव|चिंता|मन/i },
  { icon: '🏃', tone: 'green', test: /exercis|walk|yoga|activ|workout|stretch|व्यायाम|टहल|योग/i },
  { icon: '🥗', tone: 'green', test: /food|\beat(s|ing)?\b|meal|diet|fruit|vegetable|dal|roti|rice|khichdi|protein|खाना|भोजन|आहार|फल|सब्ज/i },
  { icon: '🧼', tone: 'blue', test: /wash|hand|hygien|clean|soap|साफ|हाथ|स्वच्छ/i },
  { icon: '🧊', tone: 'blue', test: /cold compress|sponge|lukewarm|cool|ice|ठंडा|गीला कपड़ा/i },
  { icon: '⏱️', tone: 'amber', test: /\bdays?\b|\bhours?\b|lasts|more than|longer|दिन|घंट/i },
  { icon: '👶', tone: 'pink', test: /baby|infant|newborn|child|toddler|बच्च|शिशु/i },
  { icon: '👀', tone: 'amber', test: /watch|monitor|observe|sign|symptom|irritab|unusual|ध्यान|लक्षण|नज़र/i },
]

const HEADING_RULES: VisualRule[] = [
  { icon: '🚑', tone: 'red', test: /emergenc|urgent|आपात/i },
  { icon: '🌿', tone: 'green', test: /remed|nuskh|घरेलू|नुस्ख|remède|tiba|علاج/i },
  { icon: '🩺', tone: 'teal', test: /doctor|clinician|see a|when to|डॉक्टर|कब/i },
  { icon: '🏠', tone: 'green', test: /home|at home|घर/i },
  { icon: '🚫', tone: 'red', test: /avoid|don'?t|never|बचें|न करें/i },
  { icon: '❓', tone: 'indigo', test: /question|ask|पूछ|सवाल/i },
  { icon: '🔍', tone: 'amber', test: /sign|symptom|cause|लक्षण|कारण/i },
  { icon: '🥗', tone: 'green', test: /meal|food|diet|\beat(s|ing)?\b|भोजन|खाना/i },
]

export type ReplyVisual = { icon: string; tone: string }

export function visualForText(text: string): ReplyVisual {
  const hit = RULES.find((r) => r.test.test(text))
  return hit ? { icon: hit.icon, tone: hit.tone } : { icon: '✅', tone: 'green' }
}

export function visualForHeading(text: string): ReplyVisual | null {
  const hit = HEADING_RULES.find((r) => r.test.test(text))
  return hit ? { icon: hit.icon, tone: hit.tone } : null
}
