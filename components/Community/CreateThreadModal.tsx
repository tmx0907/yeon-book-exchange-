import React, { useState } from 'react';
import { User } from '../../types';
import { CommunityCategory } from '../../types/community';
import { X, Globe, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CreateThreadModalProps {
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({ user, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<CommunityCategory>('General');
    const [visibility, setVisibility] = useState<'Global' | 'Local'>('Global');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);

        const newThread = {
            title,
            content,
            user_id: user.id,
            category,
            country: 'AU', // Hardcoded for MVP
            region: user.state,
            is_global: visibility === 'Global',
            tags: [] // Can add tag input later
        };

        const { error } = await supabase.from('threads').insert([newThread]);

        setIsSubmitting(false);
        if (!error) {
            onSuccess();
        } else {
            alert('Failed to create post. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-serif text-2xl text-slate-900">Start a Discussion</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder-slate-400 font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <div className="flex flex-wrap gap-3">
                            {(['General', 'Relations', 'Region', 'Help'] as CommunityCategory[]).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts, questions, or stories..."
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-sky-100 text-slate-900 placeholder-slate-400 resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Visibility</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setVisibility('Global')}
                                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${visibility === 'Global'
                                        ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                                        : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${visibility === 'Global' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-bold ${visibility === 'Global' ? 'text-sky-900' : 'text-slate-700'}`}>Global</p>
                                    <p className="text-xs text-slate-500">Visible to everyone</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setVisibility('Local')}
                                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${visibility === 'Local'
                                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                                        : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${visibility === 'Local' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-bold ${visibility === 'Local' ? 'text-emerald-900' : 'text-slate-700'}`}>My Region</p>
                                    <p className="text-xs text-slate-500">Only {user.state} members</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Post Discussion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThreadModal;
