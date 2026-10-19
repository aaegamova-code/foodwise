import type {
  AssistantReply,
  Meal,
  MealOption,
  PracticeKind,
  PrincipleId,
  Situation,
  UserContext,
} from '../types';
import { MEALS, mealById } from '../data/meals';
import { parseMessage } from './parse';
import { ALLERGEN_LABEL, DIET_LABEL, violation } from './safety';

/**
 * FoodWise Interactive Demo engine.
 * A transparent, rule-based stand-in for a future AI service. It receives the same inputs
 * a real model would (saved context + conversation state + new message) and returns
 * structured recommendations that the UI renders.
 */

export interface EngineSession {
  situation: Situation;
  shownIds: string[];
  lastIds?: string[]; // options shown in the latest reply
  turn: number;
}

export const emptySession = (): EngineSession => ({ situation: { avoid: [] }, shownIds: [], turn: 0 });

export interface EngineInput {
  text: string;
  context: UserContext;
  userName: string;
  session: EngineSession;
}

export interface EngineOutput {
  reply: AssistantReply;
  session: EngineSession;
}

export const fmtUZS = (n: number) => n.toLocaleString('en-US').replace(/,/g, ' ');
export const fmtRange = ([a, b]: [number, number]) => `${fmtUZS(a)}–${fmtUZS(b)}`;

const SUGGESTIONS = [
  'I skipped breakfast because of work. I am really hungry and need to buy lunch. My budget is 50,000 UZS and I have about 15 minutes.',
  'I’m tired this evening and don’t want to cook much. What could I have for dinner?',
  'I’d like a traditional Uzbek lunch that still feels balanced.',
  'Can you suggest a vegetarian lunch?',
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function prefersTraditional(ctx: UserContext, sit: Situation) {
  return !!sit.traditional || ctx.cuisines.some((c) => /uzbek|central asian/i.test(c));
}

function likesMeal(ctx: UserContext, meal: Meal) {
  return ctx.likes.some((l) => meal.keywords.includes(l) || meal.name.toLowerCase().includes(l));
}

function score(meal: Meal, ctx: UserContext, sit: Situation, seed: number): number {
  let s = 0;
  const mealTime = sit.mealTime ?? 'lunch';
  s += meal.mealTimes.includes(mealTime) ? 2 : -3;
  if (prefersTraditional(ctx, sit) && meal.cuisine === 'uzbek') s += 3;
  if (sit.skippedMeal || sit.veryHungry) {
    if (meal.satiety === 'hearty') s += 2;
    if (meal.satiety === 'light') s -= 4;
  }
  if (sit.tired) {
    if (meal.mode !== 'cook') s += 2;
    if (meal.minutes <= 10) s += 1;
  }
  if (sit.light) s += meal.satiety === 'light' ? 3 : meal.satiety === 'hearty' ? -1 : 1;
  if (sit.place === 'home' && meal.mode !== 'buy') s += 1.5;
  if ((sit.place === 'work' || sit.place === 'outside') && meal.mode === 'buy') s += 1;
  if (sit.budget) {
    if (meal.cost[1] <= sit.budget) s += 1;
    if (sit.budget <= 25000 && meal.cost[0] <= sit.budget * 0.8) s += 1;
  }
  if (likesMeal(ctx, meal)) s += 3;
  if (ctx.goals.some((g) => /local/i.test(g)) && meal.cuisine === 'uzbek') s += 1;
  if (ctx.goals.some((g) => /satisfied/i.test(g)) && meal.satiety === 'hearty') s += 1;
  if (ctx.goals.some((g) => /combination/i.test(g)) && meal.plate.parts.length >= 3) s += 0.5;
  s += hash(meal.id + seed) * 1.2; // gentle variety between turns
  return s;
}

function fits(meal: Meal, sit: Situation, check: { budget: boolean; time: boolean }) {
  if (check.budget && sit.budget && meal.cost[0] > sit.budget) return false;
  if (check.time && sit.minutes && meal.minutes > sit.minutes) return false;
  if (sit.cooking === 'none' && meal.mode === 'cook') return false;
  if ((sit.place === 'work' || sit.place === 'outside') && meal.mode === 'cook') return false;
  return true;
}

function pickDiverse(sorted: Meal[], n: number): Meal[] {
  const out: Meal[] = [];
  for (const m of sorted) {
    if (out.length >= n) break;
    if (!out.some((o) => o.family === m.family)) out.push(m);
  }
  for (const m of sorted) {
    if (out.length >= n) break;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

function reasonsFor(meal: Meal, ctx: UserContext, sit: Situation): string[] {
  const r: string[] = [];
  if (sit.skippedMeal && meal.satiety !== 'light') {
    r.push(`You skipped ${sit.skippedMeal}, so a satisfying meal with protein, vegetables and a source of carbohydrate may help you manage hunger and feel comfortably full for longer.`);
  } else if (sit.veryHungry && meal.satiety === 'hearty') {
    r.push('You’re very hungry, so a more substantial plate is a practical choice right now.');
  }
  if (sit.tired) {
    if (meal.mode === 'buy') r.push('No cooking needed — helpful when your energy is low.');
    else if (meal.mode === 'nocook') r.push('Just slice and assemble — no stove needed after a long day.');
    else if (meal.minutes <= 15) r.push(`About ${meal.minutes} minutes and one pan — minimal effort.`);
  }
  if (sit.budget) {
    r.push(
      meal.cost[0] <= sit.budget
        ? `At an estimated ${fmtRange(meal.cost)} UZS, it can fit your ${fmtUZS(sit.budget)} UZS budget.`
        : `It may cost a little more than ${fmtUZS(sit.budget)} UZS (estimate ${fmtRange(meal.cost)}), so it’s here as the closest option.`,
    );
  }
  if (sit.minutes) {
    r.push(
      meal.minutes <= sit.minutes
        ? `Usually ready in about ${meal.minutes} minutes, within your ~${sit.minutes} minutes.`
        : `It takes about ${meal.minutes} minutes — slightly longer than you have.`,
    );
  }
  if (prefersTraditional(ctx, sit) && meal.cuisine === 'uzbek') {
    r.push('It’s a familiar Uzbek dish. Enjoying the foods you grew up with is part of eating well — combining them thoughtfully is often more practical than avoiding them.');
  }
  if (likesMeal(ctx, meal)) r.push('It includes something you told me you enjoy.');
  if (sit.vegetarian || ctx.diet === 'vegetarian' || ctx.diet === 'vegan') r.push('Meat-free, in line with your preference.');
  if (sit.light && meal.satiety !== 'hearty') r.push('Lighter, as you asked.');
  if (ctx.allergies.length) {
    r.push(`This recipe is normally free from ${ctx.allergies.map((a) => ALLERGEN_LABEL[a]).join(', ')} — still confirm with the café, as kitchens vary.`);
  }
  return r;
}

function principlesFor(meal: Meal, ctx: UserContext, sit: Situation): PrincipleId[] {
  const set = new Set<PrincipleId>(meal.principles);
  if (prefersTraditional(ctx, sit) && meal.cuisine === 'uzbek') set.add('satisfaction');
  if (likesMeal(ctx, meal)) set.add('satisfaction');
  if (sit.skippedMeal) set.add('adequacy');
  const order: PrincipleId[] = ['adequacy', 'balance', 'moderation', 'diversity', 'satisfaction'];
  return order.filter((p) => set.has(p)).slice(0, 4);
}

function practiceKind(sit: Situation, ctx: UserContext): PracticeKind {
  if (sit.skippedMeal) return 'skipped';
  if (sit.tired) return 'tired';
  if (sit.vegetarian || ctx.diet === 'vegetarian' || ctx.diet === 'vegan') return 'vegetarian';
  if (sit.budget && sit.budget <= 25000) return 'budget';
  return 'everyday';
}

function contextChips(ctx: UserContext, sit: Situation): string[] {
  const c: string[] = [];
  ctx.allergies.forEach((a) => c.push(`No ${ALLERGEN_LABEL[a]}`));
  if (ctx.diet !== 'none') c.push(DIET_LABEL[ctx.diet]);
  if (sit.vegetarian && ctx.diet === 'none') c.push('Vegetarian today');
  if (prefersTraditional(ctx, sit)) c.push('Uzbek food');
  if (sit.skippedMeal) c.push(`Skipped ${sit.skippedMeal}`);
  if (sit.veryHungry) c.push('Very hungry');
  if (sit.tired) c.push('Tired');
  if (sit.budget) c.push(`≤ ${fmtUZS(sit.budget)} UZS`);
  if (sit.minutes) c.push(`~${sit.minutes} min`);
  if (sit.cooking === 'none') c.push('No cooking');
  [...ctx.exclusions, ...sit.avoid].forEach((w) => c.push(`No ${w}`));
  return [...new Set(c)];
}

function describeSituation(sit: Situation): string {
  const bits: string[] = [];
  if (sit.skippedMeal) bits.push(`you skipped ${sit.skippedMeal}`);
  if (sit.tired) bits.push('you’re tired');
  if (sit.minutes) bits.push(`you have about ${sit.minutes} minutes`);
  if (sit.budget) bits.push(`your budget is ${fmtUZS(sit.budget)} UZS`);
  if (!bits.length) return '';
  const last = bits.pop()!;
  const joined = bits.length ? `${bits.join(', ')} and ${last}` : last;
  return `Since ${joined}, `;
}

export function respond({ text, context: ctx, userName, session }: EngineInput): EngineOutput {
  const p = parseMessage(text);
  const turn = session.turn + 1;
  const name = userName ? ` ${userName}` : '';

  // ---- Safety first ----
  if (p.emergency) {
    return {
      session: { ...session, turn },
      reply: {
        kind: 'text',
        tone: 'urgent',
        text: 'This sounds like it could be a medical emergency. Please stop eating, and call emergency services now (103 in Uzbekistan, or your local number). If you have a prescribed adrenaline auto-injector, use it as instructed. FoodWise can’t help with emergencies.',
      },
    };
  }
  if (p.extreme) {
    return {
      session: { ...session, turn },
      reply: {
        kind: 'text',
        tone: 'care',
        text: 'I can hear that you want change, and that matters. FoodWise doesn’t support very low-calorie or rapid weight-loss plans, because they can harm your health and your relationship with food. A doctor or registered dietitian can help you set safe, realistic goals. If eating feels stressful or out of control, please consider talking to a health professional you trust. I’m happy to help you build balanced, satisfying everyday meals.',
        suggestions: [SUGGESTIONS[2], SUGGESTIONS[1]],
      },
    };
  }
  if (p.greeting) {
    return {
      session: { ...session, turn },
      reply: {
        kind: 'text',
        text: `Hi${name}! Tell me about your situation — when you last ate, how hungry or tired you are, your budget and how much time you have. I’ll suggest a few balanced options and explain why they may work for you.`,
        suggestions: SUGGESTIONS.slice(0, 3),
      },
    };
  }
  if (p.thanks && p.signals === 0) {
    return {
      session: { ...session, turn },
      reply: {
        kind: 'text',
        text: 'You’re welcome! Next time, try asking yourself three quick questions: Does this meal have some variety? Is it nourishing enough for my day? Do I actually enjoy it?',
      },
    };
  }
  if (!p.foodRelated) {
    return {
      session: { ...session, turn },
      reply: {
        kind: 'text',
        tone: 'info',
        text: 'I’m the Interactive Demo of FoodWise, so I understand everyday food situations best — hunger, skipped meals, budget, time, tiredness, preferences and swaps. I can’t answer that one reliably yet. Try describing a meal situation, for example:',
        suggestions: SUGGESTIONS,
      },
    };
  }

  // ---- Merge situation across the conversation ----
  const fresh = !p.isFollowUp && p.signals >= 3;
  const base: Situation = fresh ? { avoid: [] } : session.situation;
  const sit: Situation = { ...base, ...p.situation, avoid: [...new Set([...base.avoid, ...p.avoid, ...p.allergyMentions.map((a) => ALLERGEN_LABEL[a])])] };
  if (p.cheaper) sit.budget = Math.max(15000, Math.round(((sit.budget ?? 40000) * 0.6) / 5000) * 5000);
  if (p.situation.tired && !p.situation.cooking && !sit.place) sit.cooking = sit.cooking ?? 'minimal';

  const exclude = p.alternative ? session.lastIds ?? session.shownIds : [];
  const notes: string[] = [];

  // ---- Candidate selection ----
  const safe = MEALS.filter((m) => !violation(m, ctx, sit));
  let pool = safe.filter((m) => fits(m, sit, { budget: true, time: true }) && !exclude.includes(m.id));
  if (pool.length < 2) {
    const relaxed = safe.filter((m) => fits(m, sit, { budget: true, time: false }) && !exclude.includes(m.id));
    if (relaxed.length > pool.length) {
      pool = relaxed;
      if (sit.minutes) notes.push(`Few options are ready within ${sit.minutes} minutes in this demo, so some may take a little longer.`);
    }
  }
  if (pool.length < 2) {
    const relaxed = safe.filter((m) => fits(m, sit, { budget: false, time: false }) && !exclude.includes(m.id));
    if (relaxed.length > pool.length) {
      pool = relaxed.sort((a, b) => a.cost[0] - b.cost[0]);
      if (sit.budget) notes.push(`Options under ${fmtUZS(sit.budget)} UZS are limited in this demo, so I included the closest ones. Cooking at home, or simple combinations like beans or eggs with bread and vegetables, can stretch a small budget.`);
    }
  }
  if (pool.length < 1) pool = safe.filter((m) => !exclude.includes(m.id) || safe.length <= 3);

  if (!safe.length) {
    return {
      session: { ...session, situation: sit, turn },
      reply: {
        kind: 'text',
        tone: 'info',
        text: 'With your current allergies and exclusions, none of the meals in this demo library are safe to suggest. Please review My Context — and for complex restrictions, a registered dietitian can help you plan safely.',
      },
    };
  }

  const seed = turn;
  const rank = (list: Meal[]) => [...list].sort((a, b) => score(b, ctx, sit, seed) - score(a, ctx, sit, seed));
  let picks = pickDiverse(rank(pool), 3);
  // If "something different" leaves too few options, top up with earlier suggestions that still fit.
  if (picks.length < 3 && exclude.length) {
    const refill = rank(safe.filter((m) => exclude.includes(m.id) && fits(m, sit, { budget: true, time: false })));
    picks = [...picks, ...refill].slice(0, 3);
  }

  // ---- Requested dish ("Can I eat plov instead?") ----
  let requested: Meal | undefined;
  if (p.requestedMealId) {
    const meal = mealById(p.requestedMealId)!;
    const why = violation(meal, ctx, sit);
    if (why) {
      notes.unshift(`I left out ${meal.name.split(' with')[0]} because it ${why}.`);
    } else {
      requested = meal;
      picks = [meal, ...picks.filter((m) => m.id !== meal.id)].slice(0, 3);
    }
  }

  const options: MealOption[] = picks.map((meal) => ({
    meal,
    reasons: reasonsFor(meal, ctx, sit),
    principles: principlesFor(meal, ctx, sit),
    requested: meal === requested,
  }));

  // ---- Intro text ----
  const mealTime = sit.mealTime ?? 'lunch';
  const where = sit.cooking === 'none' || sit.place === 'outside' || sit.place === 'work' ? ' you can pick up without cooking' : sit.tired ? ' that need very little effort' : '';
  let intro: string;
  if (requested) {
    intro = `Yes — ${requested.name.split(' with')[0].toLowerCase()} can absolutely fit. ${requested.tip} I also added ${options.length - 1} other option${options.length > 2 ? 's' : ''} for comparison.`;
  } else if (p.alternative) {
    intro = `Sure — here are different options${where}, keeping everything else you told me in mind.`;
  } else {
    const lead = describeSituation(sit);
    const what = `${options.length} ${sit.skippedMeal || sit.veryHungry ? 'satisfying ' : sit.light ? 'lighter ' : ''}${mealTime} option${options.length > 1 ? 's' : ''}${where}`;
    intro = lead ? `${lead}here are ${what}.` : `Here are ${what}.`;
    intro += ' Each one combines a protein source, vegetables and a carbohydrate you can enjoy.';
    if (prefersTraditional(ctx, sit) && options.some((o) => o.meal.cuisine === 'uzbek')) intro += ' I kept familiar Uzbek dishes in the mix.';
  }
  if (p.avoid.length) intro = `Got it — no ${p.avoid.join(', ')}. ${intro}`;
  if (p.situation.budget && session.situation.budget && p.situation.budget !== session.situation.budget) {
    intro = `Updated for ${fmtUZS(p.situation.budget)} UZS. ${intro}`;
  }

  // ---- Responsible notes ----
  if (p.allergyMentions.some((a) => !ctx.allergies.includes(a))) {
    notes.push('You mentioned an allergy that isn’t in My Context yet. I’ll avoid it in this chat — please add it to My Context so it’s always respected.');
  }
  const conditions = [...new Set([...ctx.conditions, ...p.conditions])];
  if (conditions.length) {
    notes.push(`Because you mentioned ${conditions.join(', ').toLowerCase()}, treat these as general ideas only. Conditions like this often need individual dietary advice — please follow your care plan and check with your doctor or a registered dietitian.`);
  }
  if (p.physiologyQuestion) {
    notes.push('I can’t predict how a specific meal affects your blood sugar or insulin — that depends on your body and health. A doctor or dietitian can advise you personally.');
  }
  if (options.some((o) => o.meal.cost)) notes.push('Prices are illustrative estimates, not live prices.');

  return {
    session: { situation: sit, shownIds: [...new Set([...session.shownIds, ...picks.map((m) => m.id)])], lastIds: picks.map((m) => m.id), turn },
    reply: {
      kind: 'recommendation',
      intro,
      contextUsed: contextChips(ctx, sit),
      options,
      notes,
      scenario: practiceKind(sit, ctx),
    },
  };
}

/** Replace one option with the best unseen alternative (used by the "Swap" button). */
export function swapOption(
  current: MealOption[],
  index: number,
  ctx: UserContext,
  session: EngineSession,
): { option: MealOption | null; session: EngineSession } {
  const sit = session.situation;
  const taken = new Set([...session.shownIds, ...current.map((o) => o.meal.id)]);
  const safe = MEALS.filter((m) => !violation(m, ctx, sit) && !current.some((o) => o.meal.id === m.id));
  const ranked = (list: Meal[]) => [...list].sort((a, b) => score(b, ctx, sit, session.turn + index) - score(a, ctx, sit, session.turn + index));
  const fresh = ranked(safe.filter((m) => !taken.has(m.id) && fits(m, sit, { budget: true, time: true })));
  const fallback = ranked(safe.filter((m) => fits(m, sit, { budget: true, time: false })));
  const pick = fresh[0] ?? ranked(safe.filter((m) => !taken.has(m.id)))[0] ?? fallback[0];
  if (!pick) return { option: null, session };
  return {
    option: { meal: pick, reasons: reasonsFor(pick, ctx, sit), principles: principlesFor(pick, ctx, sit) },
    session: { ...session, shownIds: [...new Set([...session.shownIds, pick.id])] },
  };
}

export const SAMPLE_SCENARIOS = [
  { label: 'Skipped breakfast · 50k UZS · 15 min', text: SUGGESTIONS[0] },
  { label: 'Tired evening, minimal cooking', text: SUGGESTIONS[1] },
  { label: 'Traditional Uzbek lunch', text: SUGGESTIONS[2] },
  { label: 'Vegetarian lunch', text: SUGGESTIONS[3] },
];

export const FOLLOW_UPS = [
  'What if I don’t like eggs?',
  'Can I eat plov instead?',
  'I have only 20,000 UZS.',
  'What if I’m too tired to cook?',
  'Can you suggest a vegetarian alternative?',
];
