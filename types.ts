
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
  status: 'Available' | 'Swapped';
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
  favoriteQuote?: string;
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
  id: string;

  // 👥 People
  requester_id: string;
  requester_name: string;
  receiver_id: string;
  receiver_name: string;

  // 📚 Books
  requested_book_id: string;
  requested_book_title: string;
  offered_book_id: string;
  offered_book_title: string;

  // 📊 Status
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';

  // 💬 Messages
  message?: string;
  decline_reason?: string;

  // ⏰ Timestamps
  created_at: string;
  responded_at?: string;
  completed_at?: string;

  // 🔔 Notifications
  notification_read: boolean;
  email_sent: boolean;

  // 📍 Meeting (optional)
  meeting_location?: string;
  meeting_time?: string;
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
  proposal?: ExchangeProposal;
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