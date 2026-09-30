/**
 * Picks one illustration for an assistant reply. Files live in public/sendimage/;
 * a missing file simply hides the image.
 */
const TOPICS: { file: string; alt: string; test: RegExp }[] = [
  { file: 'ambulance emergency illustration.jpg', alt: 'Calling emergency services', test: /emergenc|ambulance|\b(108|112|911)\b|आपात/i },
  { file: 'baby vaccination illustration.jpg', alt: 'Child getting a vaccine', test: /vaccin|immuni|टीका|टीके/i },
  { file: 'child fever thermometer illustration.jpg', alt: 'Checking a child’s temperature', test: /fever|temperature|बुखार|तापमान/i },
  { file: 'cold flu child illustration.jpg', alt: 'Cough and cold care', test: /cough|cold|sneez|runny nose|breath|wheez|flu\b|खांसी|जुकाम|सर्दी/i },
  { file: 'stomach.jpg', alt: 'Tummy ache and ORS', test: /vomit|diarrh|loose motion|stomach|tummy|उल्टी|दस्त|पेट/i },
  { file: 'skin-rash.jpg', alt: 'Gentle skin care', test: /rash|itch|eczema|skin|चकत्त|खुजली|त्वचा/i },
  { file: 'first-aid.jpg', alt: 'First-aid kit', test: /first[- ]aid|wound|cut|burn|bleed|sprain|bite|घाव|जल/i },
  { file: 'pregnancy.jpg', alt: 'Healthy pregnancy', test: /pregnan|trimester|prenatal|गर्भ/i },
  { file: 'baby-care.jpg', alt: 'Mother holding a newborn', test: /newborn|breastfe|infant|baby|शिशु|नवजात/i },
  { file: 'child-growth.jpg', alt: 'Toddler growth check', test: /milestone|growth|height|weight gain|development|विकास/i },
  { file: 'diabetes.jpg', alt: 'Glucose check and healthy plate', test: /diabet|glucose|blood sugar|insulin|hba1c|शुगर|मधुमेह/i },
  { file: 'blood-pressure.jpg', alt: 'Blood pressure check', test: /blood pressure|\bbp\b|hypertens|रक्तचाप/i },
  { file: 'mental-wellness.jpg', alt: 'Calm breathing and meditation', test: /stress|anxi|panic|mood|sleep problem|mental|तनाव|चिंता/i },
  { file: 'exercise.jpg', alt: 'Walking and yoga', test: /exercis|workout|walk|yoga|fitness|steps|व्यायाम|योग/i },
  { file: 'medicine pills illustration.jpg', alt: 'Medicines and pill box', test: /medicin|tablet|syrup|dose|paracetamol|antibiotic|दवा/i },
  { file: 'lab-report.jpg', alt: 'Reading a lab report', test: /report|lab test|blood test|hemoglobin|cbc|prescription|रिपोर्ट/i },
  { file: 'indian thali illustration.jpg', alt: 'Balanced Indian thali', test: /meal|diet|food|nutrition|breakfast|lunch|dinner|protein|खाना|भोजन|आहार/i },
  { file: 'hydration.jpg', alt: 'Water, ORS and coconut water', test: /dehydrat|hydrat|\bors\b|fluids/i },
  { file: 'hygiene.jpg', alt: 'Washing hands with soap', test: /hand ?wash|hygien|wash hands|sanitiz|हाथ धो/i },
  { file: 'rest-sleep.jpg', alt: 'Resting and sleeping well', test: /\bsleep|insomnia|नींद/i },
  { file: 'doctor consultation family illustration.jpg', alt: 'Talking to a doctor', test: /doctor|clinic|hospital|specialist|appointment|डॉक्टर/i },
]

const GENERAL = { file: 'health care heart illustration.jpg', alt: 'Health and wellbeing' }

export type ReplyImage = { src: string; alt: string }

export function replyImageFor(question: string, reply: string): ReplyImage | null {
  const words = reply.trim().split(/\s+/).length
  const substantial = words >= 30 && /\n\s*([-*]|\d+\.)\s|\n#/.test(reply)
  if (!substantial) return null
  const topic = TOPICS.find((t) => t.test.test(question)) ?? TOPICS.find((t) => t.test.test(reply)) ?? GENERAL
  return { src: `/sendimage/${encodeURIComponent(topic.file)}`, alt: topic.alt }
}

const IMAGE_EVERY = 4

/**
 * Ids of assistant replies that get an image: at most one per IMAGE_EVERY replies, placed on the
 * first substantial reply once the gap is reached, so images show up every 4–5 chats.
 */
export function replyImageIds(
  messages: { id: string; role: string; content: string }[],
): Set<string> {
  const ids = new Set<string>()
  let sinceLast = 0
  messages.forEach((m, i) => {
    if (m.role !== 'ASSISTANT') return
    sinceLast += 1
    if (sinceLast < IMAGE_EVERY) return
    const prev = messages[i - 1]
    const question = prev?.role === 'USER' ? prev.content : ''
    if (replyImageFor(question, m.content)) {
      ids.add(m.id)
      sinceLast = 0
    }
  })
  return ids
}

/** Splits the opening paragraph from the rest so the image can sit between them. */
export function splitIntro(content: string): { intro: string; rest: string } {
  const trimmed = content.trimStart()
  if (/^(#|[-*]\s|\d+\.\s|>)/.test(trimmed)) return { intro: '', rest: content }
  const idx = trimmed.search(/\n\s*\n/)
  if (idx === -1) return { intro: trimmed, rest: '' }
  return { intro: trimmed.slice(0, idx), rest: trimmed.slice(idx) }
}
