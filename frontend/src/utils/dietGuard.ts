export type Diet = 'vegetarian' | 'eggetarian' | 'vegan' | 'non-vegetarian'

interface DietRule {
  label: string
  meaning: string
  forbidden: string[]
}

const MEAT_FISH = [
  'chicken', 'mutton', 'lamb', 'goat meat', 'beef', 'pork', 'bacon', 'ham', 'sausage', 'salami',
  'pepperoni', 'turkey', 'duck', 'meat', 'meatball', 'keema', 'kheema', 'fish', 'salmon', 'tuna',
  'sardine', 'mackerel', 'cod', 'tilapia', 'prawn', 'shrimp', 'crab', 'lobster', 'squid',
  'oyster', 'clam', 'mussel', 'seafood', 'anchovy', 'fish sauce', 'gelatin', 'gelatine',
  'bone broth', 'chicken broth', 'chicken stock', 'lard',
]

const EGG = ['egg', 'eggs', 'egg white', 'egg whites', 'omelette', 'omelet', 'anda', 'boiled egg', 'mayonnaise']

const DAIRY_HONEY = [
  'milk', 'paneer', 'curd', 'dahi', 'yogurt', 'yoghurt', 'greek yogurt', 'ghee', 'butter',
  'cheese', 'cream', 'buttermilk', 'chaas', 'lassi', 'raita', 'khoya', 'whey', 'honey',
]

const RULES: Record<Diet, DietRule> = {
  vegetarian: {
    label: 'vegetarian (Indian meaning)',
    meaning: 'no meat, poultry, fish, seafood or eggs. Dairy (milk, paneer, curd, ghee) is allowed.',
    forbidden: [...MEAT_FISH, ...EGG],
  },
  eggetarian: {
    label: 'eggetarian',
    meaning: 'no meat, poultry, fish or seafood. Eggs and dairy are allowed.',
    forbidden: MEAT_FISH,
  },
  vegan: {
    label: 'vegan',
    meaning: 'no animal products at all — no meat, fish, eggs, dairy, ghee or honey.',
    forbidden: [...MEAT_FISH, ...EGG, ...DAIRY_HONEY],
  },
  'non-vegetarian': {
    label: 'non-vegetarian',
    meaning: 'eats eggs, chicken, fish and meat as well as vegetarian food.',
    forbidden: [],
  },
}

const NON_VEG =
  /\bnon[\s-]?veg[a-z]*|\b(i|we)\s+(eat|like|love|prefer)\s+(chicken|meat|fish|mutton|eggs?\s+and\s+(chicken|meat|fish))\b|\bmaa?nsaa?hari\b|मांसाहारी/i
const VEGAN = /\bvegan\b/i
const EGGETARIAN = /\beggetarian\b|\b(i|we)\s+(do\s+)?eat\s+eggs?\b|\beggs?\s+(are|is)\s+(ok|okay|fine)\b/i
const VEGETARIAN =
  /\bveg\b|\bveggie\b|\bpure[\s-]?veg\b|\bveg(e|i)?t(a|e)?r(i|a)?(a|e)?n\b|\bvegetar\w*|\bvegitar\w*|\bvegetr\w*|\bno\s+(meat|non[\s-]?veg)\b|\b(don'?t|do not|never)\s+eat\s+(meat|non[\s-]?veg|chicken|fish|eggs?)\b|\bsh?aa?kaa?hari\b|शाकाहारी|शुद्ध\s*शाकाहारी/i

/** Finds the most recent diet the user stated in their own messages. */
export function detectDiet(userMessages: string[]): Diet | null {
  for (let i = userMessages.length - 1; i >= 0; i--) {
    const text = userMessages[i]
    if (NON_VEG.test(text)) return 'non-vegetarian'
    if (VEGAN.test(text)) return 'vegan'
    if (EGGETARIAN.test(text)) return 'eggetarian'
    if (VEGETARIAN.test(text)) return 'vegetarian'
  }
  return null
}

export function dietConstraint(diet: Diet): string {
  const rule = RULES[diet]
  if (diet === 'non-vegetarian') {
    return `
DIET (the user is non-vegetarian): they eat eggs, chicken, fish and meat as well as vegetarian food.
Whenever you suggest meals, recipes or snacks, include non-vegetarian options (e.g. boiled eggs,
egg bhurji, grilled or tandoori chicken, fish curry, lean mutton) alongside vegetarian ones.
Prefer healthy preparations (grilled, baked, steamed, curry with little oil) over fried food, and
keep portions suitable for their health goal. Default to commonly eaten local items; do not suggest
beef or pork unless the user mentions them.
`.trim()
  }
  return `
STRICT DIET RULE (the user is ${rule.label}): ${rule.meaning}
Every food, meal, recipe, snack and ingredient you suggest MUST follow this rule. Never mention
forbidden items even as an "option", "if you eat it" or a swap. Forbidden: ${rule.forbidden.join(', ')}.
Use suitable alternatives instead (e.g. paneer, tofu, dal, chana, rajma, soya chunks, sprouts, besan) as the diet allows.
`.trim()
}

const NEGATION = /\b(no|without|avoid|avoiding|skip|exclude|excluding|instead of|replace|free of|not)\s+(\w+\s+){0,2}$/i

/** Returns forbidden foods that appear in the reply as actual suggestions (negated mentions are ignored). */
export function findDietViolations(reply: string, diet: Diet): string[] {
  const found = new Set<string>()
  const lower = reply.toLowerCase()
  for (const item of RULES[diet].forbidden) {
    const re = new RegExp(`\\b${item.replace(/\s+/g, '\\s+')}\\b`, 'gi')
    let match: RegExpExecArray | null
    while ((match = re.exec(lower))) {
      const before = lower.slice(Math.max(0, match.index - 40), match.index)
      const after = lower.slice(match.index + match[0].length, match.index + match[0].length + 8)
      if (NEGATION.test(before) || /^[\s-]*free\b/.test(after)) continue
      found.add(item)
      break
    }
  }
  return [...found]
}

const FOOD_CONTEXT =
  /\b(breakfast|lunch|dinner|snacks?|meals?|recipes?|menu|diet plan|meal plan|dal|roti|chapati|rice|salad|curry|sabzi|poha|upma|idli|dosa)\b/i

function mentionsAny(reply: string, items: string[]): boolean {
  return items.some((item) => new RegExp(`\\b${item.replace(/\s+/g, '\\s+')}\\b`, 'i').test(reply))
}

/**
 * Returns an instruction to rewrite the reply when it breaks the user's diet, or null when it is fine.
 */
export function dietCorrection(reply: string, diet: Diet): string | null {
  if (diet === 'non-vegetarian') {
    if (!FOOD_CONTEXT.test(reply) || mentionsAny(reply, [...MEAT_FISH, ...EGG])) return null
    return 'I am non-vegetarian. Rewrite the complete answer so it includes non-vegetarian options (eggs, chicken, fish or mutton) alongside vegetarian ones. Do not apologise or refer to this correction.'
  }
  const violations = findDietViolations(reply, diet)
  if (violations.length === 0) return null
  return `Your answer included ${violations.join(', ')}, which I cannot eat (${diet}). Rewrite the complete answer from scratch with only ${diet} foods. Do not mention those items at all, and do not apologise or refer to this correction.`
}
