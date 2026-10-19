import type { FoodTag, PracticeKind } from '../types';

// Building blocks for the "Try Making Your Own Choice" exercise.
// Options are composed from safe items so confirmed allergies are always respected.

export interface PracticeItem {
  name: string;
  contains: FoodTag[];
}

export const PROTEINS: PracticeItem[] = [
  { name: 'boiled eggs', contains: ['egg'] },
  { name: 'grilled chicken', contains: ['poultry', 'meat'] },
  { name: 'lentils', contains: [] },
  { name: 'red beans', contains: [] },
  { name: 'katyk (yogurt)', contains: ['dairy'] },
  { name: 'chickpeas', contains: [] },
];

export const VEGETABLES: PracticeItem[] = [
  { name: 'a tomato-cucumber salad', contains: [] },
  { name: 'stewed vegetables', contains: [] },
  { name: 'cabbage-carrot salad', contains: [] },
];

export const CARBS: PracticeItem[] = [
  { name: 'non bread', contains: ['gluten'] },
  { name: 'rice', contains: [] },
  { name: 'buckwheat', contains: [] },
  { name: 'potatoes', contains: [] },
];

export const CARB_HEAVY: PracticeItem[] = [
  { name: 'two pieces of non with sweet tea', contains: ['gluten'] },
  { name: 'a large bowl of plain rice with sweet tea', contains: [] },
  { name: 'two sweet pastries and a soda', contains: ['gluten', 'dairy', 'egg'] },
];

export const SCENARIOS: Record<PracticeKind, { title: string; prompt: string; lightNote: string }> = {
  skipped: {
    title: 'Skipped breakfast, busy day',
    prompt: 'You skipped breakfast and need an affordable lunch near work. Which combination would be a more balanced choice for your situation?',
    lightNote: 'After a skipped meal, this may be too light to keep you comfortable until evening.',
  },
  tired: {
    title: 'Tired evening',
    prompt: 'It’s 8 pm, you’re tired and don’t want to cook much. Which combination would be a more balanced, low-effort dinner?',
    lightNote: 'It’s light and easy, but on its own it may leave you hungry later in the evening.',
  },
  vegetarian: {
    title: 'Meat-free lunch',
    prompt: 'You want a meat-free lunch that still keeps you full. Which combination would be a more balanced choice?',
    lightNote: 'Vegetables are a great base, but without a protein source it may not keep you full for long.',
  },
  budget: {
    title: 'Tight budget',
    prompt: 'You have about 20,000 UZS for lunch. Which combination would be a more balanced choice within that budget?',
    lightNote: 'It’s affordable, but quite light — a cheap protein like beans or eggs could make it more filling.',
  },
  everyday: {
    title: 'Everyday lunch',
    prompt: 'It’s a normal day and you’re choosing lunch. Which combination would be a more balanced choice for you?',
    lightNote: 'A fresh start — but on its own it may not give you enough energy for the afternoon.',
  },
};

export const REFLECTION_QUESTIONS = [
  { id: 'variety', q: 'Does this meal include some variety?', hint: 'Different colours and food groups.' },
  { id: 'nourish', q: 'Is it nourishing enough for my situation?', hint: 'Hunger, activity, time since last meal.' },
  { id: 'enjoy', q: 'Is it something I actually enjoy?', hint: 'Taste and tradition matter too.' },
];
