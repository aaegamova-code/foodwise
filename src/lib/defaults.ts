import type { LearningProgress, UserContext } from '../types';

export const EMPTY_CONTEXT: UserContext = {
  allergies: [],
  exclusions: [],
  diet: 'none',
  cuisines: [],
  goals: [],
  conditions: [],
  likes: [],
};

export const EMPTY_PROGRESS: LearningProgress = {
  received: false,
  understood: false,
  recognized: false,
  practiced: false,
  practiceCount: 0,
};

export type SetupState = 'pending' | 'done' | 'skipped';
