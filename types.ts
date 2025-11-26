export type Language = 'en' | 'ko';

export type State = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'ACT' | 'TAS' | 'NT';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  condition: 'New' | 'Like New' | 'Good' | 'Acceptable';
  ownerId: string;
  ownerName: string;
  location: {
    suburb: string;
    state: State;
  };
  points: number;
  imageUrl: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  state: State;
  points: number;
  booksRead: number;
  rating: number; // 0-5
}

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  en: Translation;
  ko: Translation;
}
