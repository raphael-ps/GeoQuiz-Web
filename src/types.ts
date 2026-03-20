export type Category = 'flags' | 'capitals' | 'continents' | 'landmarks' | 'brazil';

export interface Country {
  id: string;
  name: string;
  flag: string;
  capital: string;
  continent: string;
  landmark?: {
    name: string;
    image?: string;
  };
  fact?: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

export interface Question {
  id: string;
  type: 'flag' | 'capital' | 'continent' | 'landmark';
  countryId: string;
  question: string;
  image?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extremely-hard';

export interface RankingEntry {
  name: string;
  score: number;
  totalTime: number;
  difficulty: Difficulty;
  date: string;
}

export interface GameState {
  score: number;
  lives: number;
  currentCountry: Country | null;
  currentQuestion: Question | null;
  isBonusPhase: boolean;
  gameStatus: 'landing' | 'mode-selection' | 'question' | 'gameover' | 'ranking' | 'multiplayer-lobby' | 'multiplayer-game' | 'daily-challenge-intro';
  mode: 'countries' | 'brazil' | 'daily' | 'multiplayer' | null;
  difficulty: Difficulty;
  history: string[]; // IDs of countries already used
  totalTime: number;
  correctPrimary: number;
  wrongPrimary: number;
  correctBonus: number;
  wrongBonus: number;
  isFlagRevealed?: boolean;
  currentClipPath?: string;
  isDailyChallenge?: boolean;
  dailySeed?: number;
  dailyCountries?: Country[];
  achievements: string[];
  multiplayerRoomId?: string;
  opponent?: { name: string; score: number };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
}
