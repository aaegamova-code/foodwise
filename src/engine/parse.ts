import type { Allergen, Diet, Situation, UserContext } from '../types';
import { MEALS } from '../data/meals';
import { ALLERGEN_PATTERNS } from './safety';

// Transparent, rule-based text understanding for the Interactive Demo.
// It recognises common phrasings; anything else is acknowledged honestly as a limitation.

export const FOOD_WORDS = [
  'eggs', 'egg', 'meat', 'lamb', 'beef', 'mutton', 'chicken', 'fish', 'rice', 'bread', 'milk', 'yogurt', 'cheese',
  'beans', 'lentils', 'onions', 'onion', 'tomatoes', 'tomato', 'mushrooms', 'cabbage', 'potatoes', 'potato',
  'carrots', 'noodles', 'buckwheat', 'chickpeas', 'soup', 'dairy', 'nuts', 'plov', 'shurpa', 'lagman', 'samsa',
  'moshkhurda', 'mastava', 'dimlama', 'shashlik', 'fruit', 'salad', 'spicy food', 'sweets',
];

export const GOAL_OPTIONS = [
  'Eat more balanced meals',
  'Improve everyday eating habits',
  'Feel more satisfied after meals',
  'Learn healthier food combinations',
  'Explore more nutritious local foods',
];

export const CUISINE_OPTIONS = ['Uzbek', 'Central Asian', 'Russian', 'Korean', 'Turkish', 'Mediterranean'];

const CONDITION_PATTERNS: Array<[RegExp, string]> = [
  [/diabet/, 'Diabetes'],
  [/hypertension|high blood pressure/, 'High blood pressure'],
  [/celiac|coeliac/, 'Coeliac disease'],
  [/\bibs\b|irritable bowel/, 'IBS'],
  [/kidney|renal/, 'Kidney condition'],
  [/pregnan/, 'Pregnancy'],
  [/an(a)?emi/, 'Anaemia'],
  [/cholesterol/, 'High cholesterol'],
  [/gastritis|reflux|gerd/, 'Gastritis / reflux'],
  [/heart disease|cardiac/, 'Heart condition'],
];

const norm = (t: string) => t.toLowerCase().replace(/[’‘`]/g, "'");

function foodWordsIn(fragment: string): string[] {
  const found: string[] = [];
  for (const w of FOOD_WORDS) {
    const re = new RegExp(`\\b${w}\\b`);
    if (re.test(fragment) && !found.some((f) => f.startsWith(w) || w.startsWith(f))) found.push(w);
  }
  return found;
}

function captureAfter(text: string, re: RegExp): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(re)) out.push(...foodWordsIn(m[1] ?? ''));
  return out;
}

const DISLIKE_RE = /(?:don't|do not|doesn't|dont|never|can't|cannot) (?:really )?(?:like|eat|want|enjoy|stand)\s+([^.,;!?]+)/g;
const NO_RE = /\b(?:no|without|not|hate|dislike|avoid|skip the|instead of)\s+([a-z ]{3,30})/g;

export function allergensIn(text: string): Allergen[] {
  const t = norm(text);
  const segments = t.split(/[.;!?\n]|,(?=\s*(?:i|and i|but)\b)/).filter((s) => /allerg|intoleran|celiac|coeliac|anaphyla|can't have/.test(s));
  const found = new Set<Allergen>();
  for (const seg of segments) {
    for (const [a, re] of Object.entries(ALLERGEN_PATTERNS) as Array<[Allergen, RegExp]>) {
      if (re.test(seg)) found.add(a);
    }
  }
  return [...found];
}

export function conditionsIn(text: string): string[] {
  const t = norm(text);
  return CONDITION_PATTERNS.filter(([re]) => re.test(t)).map(([, label]) => label);
}

/** Extract a stable profile from a conversational description. Every field is shown for confirmation first. */
export function parseProfile(text: string): Partial<UserContext> {
  const t = norm(text);
  const out: Partial<UserContext> = {};

  const age = t.match(/(\d{2})\s*(?:years?(?:\s*old)?|y\.?o\.?\b)|\b(?:i'm|i am|age|aged)\s*(\d{2})\b/);
  if (age) {
    const n = Number(age[1] ?? age[2]);
    if (n >= 16 && n <= 100) out.age = n;
  }

  out.allergies = allergensIn(t);

  let diet: Diet = 'none';
  if (/\bvegan\b/.test(t)) diet = 'vegan';
  else if (/vegetarian|don't eat meat|no meat/.test(t)) diet = 'vegetarian';
  else if (/pescatarian|pescetarian/.test(t)) diet = 'pescatarian';
  else if (/\bhalal\b/.test(t)) diet = 'halal';
  out.diet = diet;

  out.cuisines = CUISINE_OPTIONS.filter((c) => t.includes(c.toLowerCase()));
  if (!out.cuisines.length && /\blocal\b|traditional|national/.test(t)) out.cuisines = ['Uzbek'];

  const goals: string[] = [];
  if (/balanced/.test(t)) goals.push(GOAL_OPTIONS[0]);
  if (/habit|healthier eating|eat healthier|healthier/.test(t)) goals.push(GOAL_OPTIONS[1]);
  if (/satisf|full(er)?\b|hungry/.test(t)) goals.push(GOAL_OPTIONS[2]);
  if (/combin/.test(t)) goals.push(GOAL_OPTIONS[3]);
  if (/local|nutritious local/.test(t)) goals.push(GOAL_OPTIONS[4]);
  out.goals = [...new Set(goals)];

  out.conditions = conditionsIn(t);

  // Dislikes: skip words already captured as allergens.
  const dislikes = captureAfter(t, DISLIKE_RE).filter((w) => !out.allergies!.some((a) => ALLERGEN_PATTERNS[a].test(w)));
  out.exclusions = [...new Set(dislikes)];

  const likes = captureAfter(t, /(?:love|enjoy|favou?rite|like eating|i like)\s+([^.,;!?]+)/g).filter((w) => !out.exclusions!.includes(w));
  out.likes = [...new Set(likes)];

  return out;
}

export interface ParsedMessage {
  situation: Partial<Situation>;
  avoid: string[];
  requestedMealId?: string;
  alternative: boolean;
  cheaper: boolean;
  isFollowUp: boolean;
  allergyMentions: Allergen[];
  conditions: string[];
  greeting: boolean;
  thanks: boolean;
  emergency: boolean;
  extreme: boolean;
  physiologyQuestion: boolean;
  foodRelated: boolean;
  signals: number; // how many situational facts were recognised
}

function parseBudget(t: string): number | undefined {
  const re = /(\d{1,3}(?:[\s,.]\d{3})+|\d+)\s*(k\b|thousand\b|ming\b|тыс)?\s*(uzs|sums?\b|soums?\b|so'?m\b|сум)?/g;
  let found: number | undefined;
  for (const m of t.matchAll(re)) {
    const after = t.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 8);
    if (/^\s*(min|hour|year|kg|km|am|pm|y\.o)/.test(after)) continue;
    let n = Number(m[1].replace(/[\s,.]/g, ''));
    if (m[2]) n *= 1000;
    if (m[3] || m[2] || n >= 1000) {
      if (n >= 1000 && n <= 2_000_000) found = n;
    }
  }
  return found;
}

function parseMinutes(t: string): number | undefined {
  const m = t.match(/(\d{1,3})\s*(?:-|to)?\s*(?:\d{1,3}\s*)?(?:min|mins|minutes|minute)\b/);
  if (m) return Number(m[1]);
  if (/half an hour|30 ?min/.test(t)) return 30;
  if (/\ban hour\b|1 hour|one hour/.test(t)) return 60;
  if (/no time|in a hurry|in a rush|very quick|super quick/.test(t)) return 10;
  return undefined;
}

export function parseMessage(text: string): ParsedMessage {
  const t = norm(text);
  const sit: Partial<Situation> = {};
  let signals = 0;

  const skipped = t.match(/(?:skipped|missed|didn't have|didn't eat|no time for|haven't had)\s+(breakfast|lunch|dinner)/);
  if (skipped) { sit.skippedMeal = skipped[1]; signals++; }
  else if (/haven't eaten|didn't eat|skipped a meal|skipped my meal/.test(t)) { sit.skippedMeal = 'a meal'; signals++; }

  if (/\blunch\b/.test(t) && !(skipped?.[1] === 'lunch' && !/(?:for|buy|need|want|eat)\s+lunch/.test(t))) sit.mealTime = 'lunch';
  else if (/dinner|supper|evening|tonight|\bnight\b/.test(t) && skipped?.[1] !== 'dinner') sit.mealTime = 'dinner';
  else if (/breakfast|morning/.test(t) && skipped?.[1] !== 'breakfast') sit.mealTime = 'breakfast';
  else if (/\bsnack\b/.test(t)) sit.mealTime = 'snack';
  else if (sit.skippedMeal === 'breakfast') sit.mealTime = 'lunch';
  else if (sit.skippedMeal === 'lunch') sit.mealTime = 'dinner';
  if (sit.mealTime) signals++;

  if (/really hungry|very hungry|so hungry|starving(?! myself)|famished|extremely hungry/.test(t)) { sit.veryHungry = true; signals++; }
  if (/tired|exhausted|no energy|sleepy|long day|worn out|drained/.test(t)) { sit.tired = true; signals++; }
  if (/not (very|that) hungry|something light|light meal|lighter/.test(t)) { sit.light = true; signals++; }

  const budget = parseBudget(t);
  if (budget) { sit.budget = budget; signals++; }
  const minutes = parseMinutes(t);
  if (minutes) { sit.minutes = minutes; signals++; }

  if (/too tired to cook|don't want to cook|no cooking|can't cook|without cooking|no time to cook|no kitchen|not cook/.test(t)) { sit.cooking = 'none'; signals++; }
  else if (/cook|make something|at home|kitchen/.test(t)) { sit.cooking = 'ok'; }

  if (/\bat home\b|\bhome\b/.test(t)) sit.place = 'home';
  else if (/\bwork\b|office|campus|university|\buni\b|classes/.test(t)) sit.place = 'work';
  if (/\bbuy\b|caf[eé]|restaurant|canteen|outside|street|order|takeaway/.test(t)) {
    if (sit.place !== 'home') sit.place = sit.place ?? 'outside';
    if (!sit.cooking) sit.cooking = 'none';
  }
  if (sit.place) signals++;

  if (/vegetarian|veggie|meat-?free|no meat|without meat|plant-?based|vegan/.test(t)) { sit.vegetarian = true; signals++; }
  if (/uzbek|traditional|\blocal\b|national dish|home-?style/.test(t)) { sit.traditional = true; signals++; }

  const allergyMentions = /allerg|intoleran/.test(t) ? allergensIn(t) : [];
  const avoid = [...new Set([...captureAfter(t, DISLIKE_RE), ...captureAfter(t, NO_RE)])].filter(
    (w) => !['time', 'cook', 'cooking'].includes(w),
  );

  let requestedMealId: string | undefined;
  if (/can i|could i|what about|how about|instead|i want|i'd like|i would like|craving|is .* (ok|okay|fine|healthy)|have some/.test(t)) {
    const hit = MEALS.find((m) => m.keywords.some((k) => new RegExp(`\\b${k}\\b`).test(t)) && !avoid.some((a) => m.keywords.includes(a)));
    if (hit) { requestedMealId = hit.id; signals++; }
  }

  const alternative = /alternative|something else|another|different|other option|swap|instead/.test(t) && !requestedMealId;
  const cheaper = /cheaper|less money|lower budget|tight budget|can't afford|broke/.test(t);
  const isFollowUp = /^(what if|and |but |also |ok|okay|can i|could i|how about|what about|i have only|only )|instead|alternative|too /.test(t.trim());

  const emergency = /can't breathe|cannot breathe|throat (is )?(closing|swelling)|anaphyla|chest pain|faint(ed|ing)|passing out|swollen (lips|tongue)/.test(t);
  const extreme =
    /lose \d+\s*(kg|kilos?|pounds|lbs)\s*(in|within)\s*(a|one|\d+|two)\s*(week|weeks|days?)|starv(e|ing) myself|stop eating|not eat at all|\b(300|400|500|600|700|800)\s*(kcal|calories)|crash diet|purg(e|ing)|make myself (sick|vomit)|eat nothing/.test(t);
  const physiologyQuestion = /insulin|blood sugar|glucose|spike/.test(t);
  const greeting = /^(hi|hello|hey|salom|assalomu|good (morning|evening|afternoon))\b/.test(t.trim()) && t.length < 40;
  const thanks = /^(thanks|thank you|thx|rahmat|great|perfect|cool|nice)\b/.test(t.trim()) && t.length < 40;

  const foodRelated =
    signals > 0 ||
    avoid.length > 0 ||
    allergyMentions.length > 0 ||
    /eat|food|meal|lunch|dinner|breakfast|hungry|cook|snack|recipe|plate|drink|diet|healthy|nutrition|protein|vegetable|suggest|recommend/.test(t);

  return {
    situation: sit,
    avoid,
    requestedMealId,
    alternative,
    cheaper,
    isFollowUp,
    allergyMentions,
    conditions: conditionsIn(t),
    greeting,
    thanks,
    emergency,
    extreme,
    physiologyQuestion,
    foodRelated,
    signals,
  };
}
