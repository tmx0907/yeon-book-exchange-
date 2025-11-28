export type CommunityCategory = 'General' | 'Relations' | 'Region' | 'Help';

export interface Thread {
    id: string;
    title: string;
    content: string;
    userId: string;
    userName?: string;
    userAvatar?: string;
    category: CommunityCategory;
    tags: string[];
    country: string;
    region?: string;
    isGlobal: boolean;
    createdAt: string;
    commentCount?: number;
}

export interface Comment {
    id: string;
    threadId: string;
    userId: string;
    userName?: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
}

export type ThreadFilter = 'Global' | 'MyCountry' | 'MyRegion';
