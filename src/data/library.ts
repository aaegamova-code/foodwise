export type SourceType = 'Public-health guidance' | 'Educational research' | 'Clinical perspective' | 'Coaching concept';

export interface Article {
  id: string;
  title: string;
  source: string;
  sourceType: SourceType;
  category: string;
  summary: string;
  url: string;
  thumb: string; // meal id used for the illustrated thumbnail
  tint: string;
}

// Real, publicly available pages. Summaries are FoodWise's own short paraphrases.
// Listing a source does not imply that it endorses FoodWise.
export const ARTICLES: Article[] = [
  {
    id: 'who-healthy-diet',
    title: 'Healthy diet',
    source: 'World Health Organization',
    sourceType: 'Public-health guidance',
    category: 'Healthy eating basics',
    summary:
      'WHO’s fact sheet on what a healthy diet includes across life — more fruit, vegetables, legumes and whole grains, and less free sugar, salt and unhealthy fats.',
    url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    thumb: 'bean-stew',
    tint: '#E8F1EA',
  },
  {
    id: 'who-fao-healthy-diets',
    title: 'What are healthy diets? Joint statement by the Food and Agriculture Organization of the United Nations and the World Health Organization',
    source: 'WHO & Food and Agriculture Organization (FAO)',
    sourceType: 'Public-health guidance',
    category: 'Healthy eating basics',
    summary:
      'A joint FAO/WHO statement describing healthy diets through four guiding principles: adequacy, balance, moderation and diversity — the foundation of FoodWise’s explanations.',
    url: 'https://www.who.int/publications/i/item/9789240101876',
    thumb: 'dimlama',
    tint: '#F6EEDD',
  },
  {
    id: 'who-keys',
    title: 'Healthy diet: Keys to eating well',
    source: 'World Health Organization',
    sourceType: 'Public-health guidance',
    category: 'Everyday habits',
    summary:
      'Practical, question-and-answer guidance on everyday habits: eating a variety of foods, more vegetables and fruit, and moderating salt, sugar and fats.',
    url: 'https://www.who.int/news-room/questions-and-answers/item/healthy-diet-keys-to-eating-well',
    thumb: 'chickpea-salad',
    tint: '#EEF3E6',
  },
  {
    id: 'harvard-plate',
    title: 'Healthy Eating Plate',
    source: 'Harvard T.H. Chan School of Public Health — The Nutrition Source',
    sourceType: 'Educational research',
    category: 'Balanced plate',
    summary:
      'A visual guide to building balanced meals — vegetables and fruit, whole grains and healthy protein. FoodWise’s plate illustrations draw on this idea as a flexible guide, not a rule.',
    url: 'https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/',
    thumb: 'shashlik',
    tint: '#E4EFE8',
  },
  {
    id: 'harvard-health',
    title: 'Diet and Nutrition',
    source: 'Harvard Health Publishing',
    sourceType: 'Educational research',
    category: 'Everyday habits',
    summary:
      'A collection of accessible articles from Harvard Medical School’s publishing division on eating patterns, specific foods and nutrition for everyday health.',
    url: 'https://www.health.harvard.edu/topics/diet-and-nutrition',
    thumb: 'baked-fish',
    tint: '#F3EEE4',
  },
  {
    id: 'ifm-food-first',
    title: 'A Food First Approach: The Power of Nutrition',
    source: 'The Institute for Functional Medicine',
    sourceType: 'Clinical perspective',
    category: 'Food-first perspective',
    summary:
      'An institutional perspective on prioritising whole-food changes in care. Read it as one clinical viewpoint — it does not carry the same evidence status as WHO guidance.',
    url: 'https://www.ifm.org/articles/food-first-diet-improves-outcome',
    thumb: 'moshkhurda',
    tint: '#F7EBDD',
  },
  {
    id: 'iin-bio-individual',
    title: 'Tips for Embracing Bio-Individual Nutrition',
    source: 'Institute for Integrative Nutrition',
    sourceType: 'Coaching concept',
    category: 'Personalisation',
    summary:
      '“Bio-individuality” is a health-coaching idea that no single way of eating suits everyone. Useful for reflection — it is a coaching concept, not a clinical guideline.',
    url: 'https://www.integrativenutrition.com/blog/tips-for-embracing-bio-individual-nutrition',
    thumb: 'katyk-bowl',
    tint: '#EFEAF3',
  },
];

export const SOURCE_TYPE_INFO: Record<SourceType, string> = {
  'Public-health guidance': 'Official recommendations from international public-health bodies.',
  'Educational research': 'University-based education summarising nutrition research.',
  'Clinical perspective': 'An institutional clinical viewpoint; evidence strength varies by claim.',
  'Coaching concept': 'A health-coaching idea for reflection, not a clinical guideline.',
};
