import React, { useState, useEffect } from 'react';
import { Thread, CommunityCategory, ThreadFilter } from '../../types/community';
import { User } from '../../types';
import ThreadList from './ThreadList';
import ThreadDetail from './ThreadDetail';
import CreateThreadModal from './CreateThreadModal';
import { MessageSquare, MapPin, Globe, Heart, HelpCircle, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CommunityMainProps {
    user: User | null;
    onLoginRedirect: () => void;
}

const CommunityMain: React.FC<CommunityMainProps> = ({ user, onLoginRedirect }) => {
    const [activeCategory, setActiveCategory] = useState<CommunityCategory | 'All'>('All');
    const [activeFilter, setActiveFilter] = useState<ThreadFilter>('Global');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThreads();
    }, [activeCategory, activeFilter, user]);

    const fetchThreads = async () => {
        setLoading(true);
        let query = supabase
            .from('threads')
            .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
            .order('created_at', { ascending: false });

        // Apply Category Filter
        if (activeCategory !== 'All') {
            query = query.eq('category', activeCategory);
        }

        // Apply Region/Country Filter
        if (activeFilter === 'MyCountry' && user) {
            query = query.eq('country', 'AU'); // Hardcoded to AU for MVP or user.state mapping
        } else if (activeFilter === 'MyRegion' && user) {
            query = query.eq('region', user.state);
        }
        // Global shows everything (or explicitly is_global=true if we want strict separation)

        const { data, error } = await query;

        if (data) {
            const mappedThreads: Thread[] = data.map((t: any) => ({
                id: t.id,
                title: t.title,
                content: t.content,
                userId: t.user_id,
                userName: t.profiles?.name || 'Anonymous',
                userAvatar: t.profiles?.avatar_url,
                category: t.category,
                tags: t.tags || [],
                country: t.country,
                region: t.region,
                isGlobal: t.is_global,
                createdAt: t.created_at,
                commentCount: 0 // TODO: Count comments
            }));
            setThreads(mappedThreads);
        }
        setLoading(false);
    };

    const handleCreateClick = () => {
        if (!user) {
            onLoginRedirect();
            return;
        }
        setIsCreateModalOpen(true);
    };

    const handleThreadCreated = () => {
        setIsCreateModalOpen(false);
        fetchThreads();
    };

    if (selectedThread) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <ThreadDetail
                    thread={selectedThread}
                    user={user}
                    onBack={() => setSelectedThread(null)}
                    onLoginRedirect={onLoginRedirect}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Top Filters */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <button
                            onClick={handleCreateClick}
                            className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
                        >
                            <Plus className="w-5 h-5" />
                            Write Post
                        </button>
                    </div>

                    <div>
                        <h3 className="font-serif text-lg text-slate-900 mb-4">Filters</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveFilter('Global')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeFilter === 'Global' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Globe className="w-4 h-4" /> Global
                            </button>
                            <button
                                onClick={() => setActiveFilter('MyCountry')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeFilter === 'MyCountry' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <MapPin className="w-4 h-4" /> My Country (AU)
                            </button>
                            <button
                                onClick={() => setActiveFilter('MyRegion')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeFilter === 'MyRegion' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <MapPin className="w-4 h-4" /> My Region {user?.state ? `(${user.state})` : ''}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-serif text-lg text-slate-900 mb-4">Categories</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveCategory('All')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeCategory === 'All' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <MessageSquare className="w-4 h-4" /> All Stories
                            </button>
                            <button
                                onClick={() => setActiveCategory('Relations')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeCategory === 'Relations' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Heart className="w-4 h-4" /> Books & Relations
                            </button>
                            <button
                                onClick={() => setActiveCategory('Region')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeCategory === 'Region' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <MapPin className="w-4 h-4" /> Local Chat
                            </button>
                            <button
                                onClick={() => setActiveCategory('Help')}
                                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${activeCategory === 'Help' ? 'bg-slate-100 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <HelpCircle className="w-4 h-4" /> Questions & Help
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow">
                    <div className="mb-6">
                        <h2 className="font-serif text-3xl text-slate-900">
                            {activeCategory === 'All' ? 'Community' : activeCategory}
                        </h2>
                        <p className="text-slate-500">
                            {activeFilter === 'Global' ? 'Conversations from around the world' : `Discussions in ${activeFilter === 'MyCountry' ? 'Australia' : user?.state || 'your area'}`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Loading discussions...</div>
                    ) : (
                        <ThreadList threads={threads} onThreadClick={setSelectedThread} />
                    )}
                </div>
            </div>

            {isCreateModalOpen && user && (
                <CreateThreadModal
                    user={user}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleThreadCreated}
                />
            )}
        </div>
    );
};

export default CommunityMain;
