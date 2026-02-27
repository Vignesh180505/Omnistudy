
export enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  EXPLAINER = 'EXPLAINER',
  SUMMARIZER = 'SUMMARIZER',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS',
  DOC_STUDY = 'DOC_STUDY',
  REVIEW_CENTER = 'REVIEW_CENTER',
  MNEMONIC = 'MNEMONIC',
  STORY = 'STORY'
}

export interface User {
  name: string;
  email: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ReviewItem {
  id: string;
  topic: string;
  nextReview: number; // timestamp
  interval: number; // days
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MnemonicItem {
  type: string;
  phrase: string;
  explanation: string;
}

export interface StoryResult {
  title: string;
  content: string;
}
