import type { PracticeKind, Situation, UserContext } from '../types';
import { CARBS, CARB_HEAVY, PROTEINS, SCENARIOS, VEGETABLES, type PracticeItem } from '../data/practice';
import { itemAllowed } from './safety';

export type Quality = 'balanced' | 'carb' | 'light';

export interface PracticeOption {
  id: string;
  text: string;
  quality: Quality;
  feedback: string;
}

export interface PracticeExercise {
  kind: PracticeKind;
  title: string;
  prompt: string;
  options: PracticeOption[];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function pick(list: PracticeItem[], ctx: UserContext, sit: Situation | undefined, seed: number, prefer?: (i: PracticeItem) => boolean) {
  const allowed = list.filter((i) => itemAllowed(i, ctx, sit));
  const preferred = prefer ? allowed.filter(prefer) : allowed;
  const from = preferred.length ? preferred : allowed;
  return from.length ? from[seed % from.length] : undefined;
}

export function buildExercise(kind: PracticeKind, ctx: UserContext, sit: Situation | undefined, seed: number): PracticeExercise {
  const s = SCENARIOS[kind];
  const plantOnly = kind === 'vegetarian';
  const cheap = kind === 'budget';
  const protein =
    pick(PROTEINS, ctx, sit, seed, (i) => (plantOnly ? !i.contains.length : cheap ? /egg|bean|lentil|chickpea/.test(i.name) : true)) ??
    { name: 'beans', contains: [] };
  const veg = pick(VEGETABLES, ctx, sit, seed + 1)!;
  const carb = pick(CARBS, ctx, sit, seed + 2) ?? { name: 'rice', contains: [] };
  const heavy = pick(CARB_HEAVY, ctx, sit, seed) ?? { name: 'a large bowl of plain rice with sweet tea', contains: [] };

  const options: PracticeOption[] = [
    {
      id: 'balanced',
      quality: 'balanced',
      text: `${cap(carb.name)} with ${protein.name} and ${veg.name}`,
      feedback: `Good thinking. Including a protein source (${protein.name}) and vegetables alongside your main carbohydrate can help create a more balanced, satisfying meal. Different combinations can also work.`,
    },
    {
      id: 'carb',
      quality: 'carb',
      text: cap(heavy.name),
      feedback: `That’s a familiar, comforting choice — and comfort matters. To make it more balanced for this situation, you could add a protein source like ${protein.name} and some vegetables. Same foods you enjoy, with a small upgrade.`,
    },
    {
      id: 'light',
      quality: 'light',
      text: `Just ${veg.name}`,
      feedback: `Vegetables are a great start! ${s.lightNote} Adding ${protein.name} and some ${carb.name} could make it more nourishing.`,
    },
  ];

  // Deterministic shuffle so the balanced answer isn't always first.
  const order = [[0, 1, 2], [1, 0, 2], [2, 0, 1], [1, 2, 0]][seed % 4];
  return { kind, title: s.title, prompt: s.prompt, options: order.map((i) => options[i]) };
}

export const PRACTICE_KINDS: PracticeKind[] = ['skipped', 'tired', 'vegetarian', 'budget', 'everyday'];
