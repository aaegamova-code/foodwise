import type { Allergen, Diet, FoodTag, Meal, Situation, UserContext } from '../types';

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  peanut: 'peanuts',
  treenut: 'tree nuts',
  dairy: 'dairy',
  egg: 'eggs',
  gluten: 'gluten',
  soy: 'soy',
  fish: 'fish',
  shellfish: 'shellfish',
  sesame: 'sesame',
};

export const ALLERGEN_OPTIONS: Allergen[] = ['peanut', 'treenut', 'dairy', 'egg', 'gluten', 'soy', 'fish', 'shellfish', 'sesame'];

export const ALLERGEN_PATTERNS: Record<Allergen, RegExp> = {
  peanut: /peanut|groundnut/,
  treenut: /tree ?nuts?|walnut|almond|hazelnut|pistachio|cashew|pecan|(?<!pea)\bnuts\b/,
  dairy: /dairy|milk|lactose|cheese|yog(h)?urt|katyk|qatiq/,
  egg: /\beggs?\b/,
  gluten: /gluten|wheat|celiac|coeliac/,
  soy: /\bsoy|soya/,
  fish: /\bfish\b/,
  shellfish: /shellfish|shrimp|prawn|crab|lobster/,
  sesame: /sesame/,
};

export const DIET_LABEL: Record<Diet, string> = {
  none: 'No specific diet',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  pescatarian: 'Pescatarian',
  halal: 'Halal',
};

const DIET_BLOCKS: Record<Diet, FoodTag[]> = {
  none: [],
  halal: [], // no pork in the demo dataset
  vegetarian: ['meat', 'poultry', 'fish', 'shellfish'],
  vegan: ['meat', 'poultry', 'fish', 'shellfish', 'dairy', 'egg'],
  pescatarian: ['meat', 'poultry'],
};

/** Words that map to whole food tags rather than plain ingredient matching. */
const WORD_TAGS: Array<[RegExp, FoodTag[]]> = [
  [/^eggs?$/, ['egg']],
  [/^meat$/, ['meat', 'poultry']],
  [/^(chicken|poultry)$/, ['poultry']],
  [/^(fish|seafood)$/, ['fish', 'shellfish']],
  [/^(milk|dairy|lactose|cheese|yogh?urt|katyk)$/, ['dairy']],
  [/^(wheat|gluten)$/, ['gluten']],
  [/^(nuts?|walnuts?)$/, ['treenut', 'peanut']],
  [/^peanuts?$/, ['peanut']],
];

export function normalizeWord(w: string) {
  return w.trim().toLowerCase();
}

/** Does a free-text exclusion ("eggs", "lamb", "onion") apply to this meal? */
export function mealMatchesWord(meal: Meal, word: string): boolean {
  const w = normalizeWord(word);
  if (!w) return false;
  for (const [re, tags] of WORD_TAGS) {
    if (re.test(w)) return tags.some((t) => meal.contains.includes(t));
  }
  const stem = w.replace(/(es|s)$/, '');
  const haystack = [meal.name, ...meal.ingredients, ...meal.keywords].join(' ').toLowerCase();
  return haystack.includes(stem);
}

export function blockedTags(ctx: UserContext, sit?: Situation): FoodTag[] {
  const tags = new Set<FoodTag>([...ctx.allergies, ...DIET_BLOCKS[ctx.diet]]);
  if (sit?.vegetarian) DIET_BLOCKS.vegetarian.forEach((t) => tags.add(t));
  return [...tags];
}

/**
 * Returns a human-readable reason if the meal must NOT be suggested, otherwise null.
 * Confirmed allergies are never relaxed.
 */
export function violation(meal: Meal, ctx: UserContext, sit?: Situation): string | null {
  for (const a of ctx.allergies) {
    if (meal.contains.includes(a)) return `usually contains ${ALLERGEN_LABEL[a]}, which is in your confirmed allergies`;
  }
  for (const t of DIET_BLOCKS[ctx.diet]) {
    if (meal.contains.includes(t)) return `doesn’t fit your ${DIET_LABEL[ctx.diet].toLowerCase()} preference`;
  }
  if (sit?.vegetarian && DIET_BLOCKS.vegetarian.some((t) => meal.contains.includes(t))) {
    return 'isn’t vegetarian';
  }
  for (const w of [...ctx.exclusions, ...(sit?.avoid ?? [])]) {
    if (mealMatchesWord(meal, w)) return `includes ${w}, which you prefer to avoid`;
  }
  return null;
}

/** Practice items only carry tags + a name, so check them the same way. */
export function itemAllowed(item: { name: string; contains: FoodTag[] }, ctx: UserContext, sit?: Situation) {
  const blocked = blockedTags(ctx, sit);
  if (item.contains.some((t) => blocked.includes(t))) return false;
  const words = [...ctx.exclusions, ...(sit?.avoid ?? [])];
  return !words.some((w) => {
    const n = normalizeWord(w);
    for (const [re, tags] of WORD_TAGS) if (re.test(n)) return tags.some((t) => item.contains.includes(t));
    return item.name.toLowerCase().includes(n.replace(/(es|s)$/, ''));
  });
}
