import type { PrincipleId } from '../types';

export interface Principle {
  id: PrincipleId;
  name: string;
  short: string;
  detail: string;
  source: 'who' | 'foodwise';
}

// Principles 1–4 paraphrase the WHO healthy diet principles.
// Satisfaction is FoodWise's own proposed addition — not a WHO principle.
export const PRINCIPLES: Principle[] = [
  {
    id: 'adequacy',
    name: 'Adequacy',
    short: 'Enough of what your body needs.',
    detail: 'Meeting your nutritional needs — energy, protein, vitamins and minerals — without unnecessary excess.',
    source: 'who',
  },
  {
    id: 'balance',
    name: 'Balance',
    short: 'A sensible mix on your plate.',
    detail: 'Keeping an appropriate balance of energy and macronutrients — carbohydrates, protein and fats — across your meals.',
    source: 'who',
  },
  {
    id: 'moderation',
    name: 'Moderation',
    short: 'Less of what to limit.',
    detail: 'Limiting excessive amounts of less beneficial components such as added sugars, excess salt and some fats — without banning foods.',
    source: 'who',
  },
  {
    id: 'diversity',
    name: 'Diversity',
    short: 'Variety across food groups.',
    detail: 'Including a variety of nutritious foods from different food groups: vegetables, fruits, legumes, whole grains and protein sources.',
    source: 'who',
  },
  {
    id: 'satisfaction',
    name: 'Satisfaction',
    short: 'Food you enjoy and can keep up.',
    detail: 'Respecting taste, cultural traditions, enjoyment and practicality — so balanced choices are sustainable in real life. This is FoodWise’s proposed addition, not an official WHO principle.',
    source: 'foodwise',
  },
];

export const principleById = (id: PrincipleId) => PRINCIPLES.find((p) => p.id === id)!;
