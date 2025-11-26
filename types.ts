
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
  email: string;
  state: State;
  suburb: string;
  points: number;
  booksRead: number;
  exchangesCompleted: number;
  rating: number; // 0-5
  joinDate: string;
  avatarUrl: string;
  favoriteQuote?: string; // New field for philosophical quote
}

export interface Discussion {
  id: string;
  bookTitle: string;
  topic: string;
  participantsCount: number;
  lastActive: string;
  imageUrl: string;
}

export interface ExchangeProposal {
  id: string; // Add ID to proposal for tracking
  targetBookId: string;
  targetBookTitle: string;
  targetBookImage: string;
  offeredBookId: string; // The book I am offering
  offeredBookTitle: string;
  offeredBookImage: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ExchangeTransaction {
  id: string;
  bookGivenTitle: string;
  bookGivenImage: string;
  bookReceivedTitle: string;
  bookReceivedImage: string;
  partnerName: string;
  date: string;
  status: 'Completed' | 'Cancelled' | 'Pending' | 'Rejected';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  proposal?: ExchangeProposal; // Optional structured data for a swap proposal
}

export interface Chat {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
}

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  en: Translation;
  ko: Translation;
}
