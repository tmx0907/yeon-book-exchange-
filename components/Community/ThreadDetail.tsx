import React, { useState, useEffect } from 'react';
import { Thread, Comment } from '../../types/community';
import { User } from '../../types';
import { ArrowLeft, Send, Clock, MapPin, MessageCircle, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ThreadDetailProps {
    thread: Thread;
    user: User | null;
    onBack: () => void;
    onLoginRedirect: () => void;
}

const ThreadDetail: React.FC<ThreadDetailProps> = ({ thread, user, onBack, onLoginRedirect }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();

        // Subscribe to new comments
        const channel = supabase
            .channel(`thread:${thread.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `thread_id=eq.${thread.id}` }, (payload) => {
                // Fetch new comment details (need profile)
                fetchNewComment(payload.new.id);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [thread.id]);

    const fetchComments = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('comments')
            .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: true });

        if (data) {
            const mappedComments: Comment[] = data.map((c: any) => ({
                id: c.id,
                threadId: c.thread_id,
                userId: c.user_id,
                userName: c.profiles?.name || 'Anonymous',
                userAvatar: c.profiles?.avatar_url,
                content: c.content,
                createdAt: c.created_at
            }));
            setComments(mappedComments);
        }
        setLoading(false);
    };

    const fetchNewComment = async (commentId: string) => {
        const { data } = await supabase
            .from('comments')
            .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
            .eq('id', commentId)
            .single();

        if (data) {
            const newC: Comment = {
                id: data.id,
                threadId: data.thread_id,
                userId: data.user_id,
                userName: data.profiles?.name || 'Anonymous',
                userAvatar: data.profiles?.avatar_url,
                content: data.content,
                createdAt: data.created_at
            };
            setComments(prev => [...prev, newC]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            onLoginRedirect();
            return;
        }
        if (!newComment.trim()) return;

        setSubmitting(true);
        await supabase.from('comments').insert([{
            thread_id: thread.id,
            user_id: user.id,
            content: newComment
        }]);
        setNewComment('');
        setSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discussions
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full">
                            {thread.category}
                        </span>
                        {thread.isGlobal ? (
                            <span className="flex items-center text-xs text-sky-600 font-bold uppercase tracking-wider">
                                <Globe className="w-3 h-3 mr-1" /> Global
                            </span>
                        ) : (
                            <span className="flex items-center text-xs text-emerald-600 font-bold uppercase tracking-wider">
                                <MapPin className="w-3 h-3 mr-1" /> {thread.region}
                            </span>
                        )}
                    </div>

                    <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-6 leading-tight">
                        {thread.title}
                    </h1>

                    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
                        <img
                            src={thread.userAvatar || `https://i.pravatar.cc/150?u=${thread.userId}`}
                            alt={thread.userName}
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="text-sm font-bold text-slate-900">{thread.userName}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(thread.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-lg leading-relaxed text-slate-700">
                        {thread.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 p-8 border-t border-slate-100">
                    <h3 className="font-serif text-xl text-slate-900 mb-6 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Comments ({comments.length})
                    </h3>

                    <div className="space-y-6 mb-8">
                        {loading ? (
                            <p className="text-slate-400 text-sm">Loading comments...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-slate-400 italic">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-4">
                                    <img
                                        src={comment.userAvatar || `https://i.pravatar.cc/150?u=${comment.userId}`}
                                        alt={comment.userName}
                                        className="w-8 h-8 rounded-full flex-shrink-0"
                                    />
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex-grow">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm text-slate-900">{comment.userName}</span>
                                            <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-700 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {user ? (
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full pl-6 pr-14 py-4 rounded-full bg-white border-none shadow-sm focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="absolute right-2 top-2 p-2 bg-slate-900 text-white rounded-full hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:hover:bg-slate-900"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 bg-white rounded-xl border border-slate-200 border-dashed">
                            <p className="text-slate-500 mb-2">Join the conversation</p>
                            <button onClick={onLoginRedirect} className="text-sky-600 font-bold hover:underline">
                                Log in to comment
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadDetail;
