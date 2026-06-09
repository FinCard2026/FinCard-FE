export type CatKey = 'housing' | 'job' | 'saving' | 'living' | 'education';

export interface Policy {
  id: string;
  cat: CatKey;
  title: string;
  tag: string;
  amount: number;
  agency: string;
  summary: string;
  eligible: string[];
  benefit: string;
  reasons: string[];
  docs: string[];
  howto: string;
  url: string;
  hot?: boolean;
  score?: number;
}

export interface Profile {
  job: string | null;
  age: string | null;
  income: string | null;
  region: string | null;
  housing: string | null;
  interests: CatKey[];
  extra: Record<string, boolean | null>;
}

export interface Cluster {
  id: number;
  name: string;
  desc: string;
  color: string;
  emoji: string;
  similarity: number;
}

export interface PointHistory {
  label: string;
  delta: number;
  time: string;
}

export interface QuizQuestion {
  id: number;
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  reward: number;
}

export interface TweakSettings {
  colorTheme: 'mint' | 'blue' | 'yellow' | 'violet' | 'coral';
  homeLayout: 'stack' | 'dash';
  cardStyle: 'soft' | 'list';
  quizBg: 'yellow' | 'white';
}

export interface CatMeta {
  label: string;
  color: string;
  g1: string;
  g2: string;
  soft: string;
}
