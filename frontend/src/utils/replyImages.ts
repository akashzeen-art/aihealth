/**
 * Picks one illustration for an assistant reply. Files live in public/images/replies/;
 * a missing file simply hides the image.
 */
const TOPICS: { file: string; alt: string; test: RegExp }[] = [
  { file: 'emergency', alt: 'Calling emergency services', test: /emergenc|ambulance|\b(108|112|911)\b|आपात/i },
  { file: 'vaccination', alt: 'Child getting a vaccine', test: /vaccin|immuni|टीका|टीके/i },
  { file: 'fever', alt: 'Checking a child’s temperature', test: /fever|temperature|बुखार|तापमान/i },
  { file: 'cough-cold', alt: 'Cough and cold care', test: /cough|cold|sneez|runny nose|breath|wheez|खांसी|जुकाम|सर्दी/i },
  { file: 'stomach', alt: 'Tummy ache and ORS', test: /vomit|diarrh|loose motion|stomach|tummy|उल्टी|दस्त|पेट/i },
  { file: 'skin-rash', alt: 'Gentle skin care', test: /rash|itch|eczema|skin|चकत्त|खुजली|त्वचा/i },
  { file: 'first-aid', alt: 'First-aid kit', test: /first[- ]aid|wound|cut|burn|bleed|sprain|bite|घाव|जल/i },
  { file: 'pregnancy', alt: 'Healthy pregnancy', test: /pregnan|trimester|prenatal|गर्भ/i },
  { file: 'baby-care', alt: 'Mother holding a newborn', test: /newborn|breastfe|infant|baby|शिशु|नवजात/i },
  { file: 'child-growth', alt: 'Toddler growth check', test: /milestone|growth|height|weight gain|development|विकास/i },
  { file: 'diabetes', alt: 'Glucose check and healthy plate', test: /diabet|glucose|blood sugar|insulin|hba1c|शुगर|मधुमेह/i },
  { file: 'blood-pressure', alt: 'Blood pressure check', test: /blood pressure|\bbp\b|hypertens|रक्तचाप/i },
  { file: 'mental-wellness', alt: 'Calm breathing and meditation', test: /stress|anxi|panic|mood|sleep problem|mental|तनाव|चिंता/i },
  { file: 'exercise', alt: 'Walking and yoga', test: /exercis|workout|walk|yoga|fitness|steps|व्यायाम|योग/i },
  { file: 'medicine', alt: 'Medicines and pill box', test: /medicin|tablet|syrup|dose|paracetamol|antibiotic|दवा/i },
  { file: 'lab-report', alt: 'Reading a lab report', test: /report|lab test|blood test|hemoglobin|cbc|prescription|रिपोर्ट/i },
  { file: 'healthy-food', alt: 'Balanced Indian thali', test: /meal|diet|food|nutrition|breakfast|lunch|dinner|protein|खाना|भोजन|आहार/i },
  { file: 'hydration', alt: 'Water, ORS and coconut water', test: /dehydrat|hydrat|\bors\b|fluids/i },
  { file: 'hygiene', alt: 'Washing hands with soap', test: /hand ?wash|hygien|wash hands|sanitiz|हाथ धो/i },
  { file: 'rest-sleep', alt: 'Resting and sleeping well', test: /\bsleep|insomnia|नींद/i },
  { file: 'doctor-visit', alt: 'Talking to a doctor', test: /doctor|clinic|hospital|specialist|appointment|डॉक्टर/i },
]

export type ReplyImage = { src: string; alt: string }

export function replyImageFor(question: string, reply: string): ReplyImage | null {
  const words = reply.trim().split(/\s+/).length
  const substantial = words >= 30 && /\n\s*([-*]|\d+\.)\s|\n#/.test(reply)
  if (!substantial) return null
  const hit = TOPICS.find((t) => t.test.test(question)) ?? TOPICS.find((t) => t.test.test(reply))
  const topic = hit ?? { file: 'general-health', alt: 'Health and wellbeing' }
  return { src: `/images/replies/${topic.file}.webp`, alt: topic.alt }
}

/** Splits the opening paragraph from the rest so the image can sit between them. */
export function splitIntro(content: string): { intro: string; rest: string } {
  const trimmed = content.trimStart()
  if (/^(#|[-*]\s|\d+\.\s|>)/.test(trimmed)) return { intro: '', rest: content }
  const idx = trimmed.search(/\n\s*\n/)
  if (idx === -1) return { intro: trimmed, rest: '' }
  return { intro: trimmed.slice(0, idx), rest: trimmed.slice(idx) }
}
