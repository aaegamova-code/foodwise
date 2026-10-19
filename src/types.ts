// Shared data model for FoodWise.
// Kept deliberately explicit so a real AI service can later return the same shapes.

export type Screen = 'home' | 'assistant' | 'library';

export type Allergen =
  | 'peanut'
  | 'treenut'
  | 'dairy'
  | 'egg'
  | 'gluten'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame';

/** Tags attached to meals: allergens plus broader food groups used for diet filtering. */
export type FoodTag = Allergen | 'meat' | 'poultry';

export type Diet = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'halal';

export type PrincipleId = 'adequacy' | 'balance' | 'moderation' | 'diversity' | 'satisfaction';

export interface UserProfile {
  name: string;
  photo?: string; // small data URL, stored on this device only
}

/** Stable, user-confirmed information. Everything is optional. */
export interface UserContext {
  age?: number;
  allergies: Allergen[];
  exclusions: string[]; // foods the user avoids or dislikes, e.g. "egg", "lamb"
  diet: Diet;
  cuisines: string[]; // e.g. "Uzbek"
  goals: string[];
  conditions: string[]; // voluntarily disclosed, never inferred
  likes: string[];
}

/** Temporary circumstances parsed from one chat message, merged across the conversation. */
export interface Situation {
  mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  skippedMeal?: string; // which meal was skipped
  veryHungry?: boolean;
  tired?: boolean;
  budget?: number; // UZS
  minutes?: number;
  place?: 'home' | 'work' | 'outside';
  cooking?: 'none' | 'minimal' | 'ok';
  vegetarian?: boolean;
  traditional?: boolean;
  light?: boolean;
  avoid: string[]; // temporary dislikes / exclusions from the chat
}

// ---------- Meals & plate visuals ----------

export type FoodKey =
  | 'rice'
  | 'plov'
  | 'bread'
  | 'noodles'
  | 'potato'
  | 'buckwheat'
  | 'salad'
  | 'greens'
  | 'stewedVeg'
  | 'meat'
  | 'chicken'
  | 'egg'
  | 'beans'
  | 'lentils'
  | 'chickpeas'
  | 'fish'
  | 'yogurt'
  | 'cheese'
  | 'fruit'
  | 'nuts'
  | 'mung';

export type SideKey = 'non' | 'salad' | 'yogurt' | 'tea' | 'fruit' | 'ayran';

export type Broth = 'shurpa' | 'moshkhurda' | 'mastava' | 'lentil' | 'lagman';

export interface PlatePart {
  food: FoodKey;
  label: string;
  share: number; // fraction of plate AREA (not calories)
  group: 'veg' | 'protein' | 'carb' | 'fruit' | 'dairy';
}

export interface PlateSpec {
  type: 'plate' | 'bowl';
  broth?: Broth;
  parts: PlatePart[];
  sides?: SideKey[];
}

export interface Meal {
  id: string;
  name: string;
  keywords: string[]; // words that refer to this dish in chat
  family: string; // used to keep suggestions varied
  cuisine: 'uzbek' | 'everyday';
  mode: 'buy' | 'cook' | 'nocook';
  minutes: number; // typical time to get it on the table
  cost: [number, number]; // illustrative UZS range, NOT live prices
  mealTimes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'>;
  satiety: 'light' | 'moderate' | 'hearty';
  contains: FoodTag[];
  ingredients: string[];
  summary: string;
  components: string; // why the components work together
  tip: string; // practical adjustment
  principles: PrincipleId[];
  plate: PlateSpec;
}

// ---------- Chat ----------

export interface MealOption {
  meal: Meal;
  reasons: string[]; // personalised circumstance reasons
  principles: PrincipleId[];
  requested?: boolean;
}

export interface RecommendationReply {
  kind: 'recommendation';
  intro: string;
  contextUsed: string[];
  options: MealOption[];
  notes: string[];
  scenario: PracticeKind;
}

export interface TextReply {
  kind: 'text';
  text: string;
  tone?: 'info' | 'care' | 'urgent';
  suggestions?: string[];
}

export type AssistantReply = RecommendationReply | TextReply;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  reply?: AssistantReply;
  chosenMealId?: string;
  openWhy?: string[]; // meal ids whose explanation is expanded
}

export type PracticeKind = 'skipped' | 'tired' | 'vegetarian' | 'budget' | 'everyday';

export interface LearningProgress {
  received: boolean;
  understood: boolean;
  recognized: boolean;
  practiced: boolean;
  practiceCount: number;
}
