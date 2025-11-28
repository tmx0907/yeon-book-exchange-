
import React from 'react';
import { Thread } from '../../types/community';
import { MessageCircle, Clock } from 'lucide-react';

interface ThreadListProps {
    threads: Thread[];
    onThreadClick: (thread: Thread) => void;
}

const ThreadList: React.FC<ThreadListProps> = ({ threads, onThreadClick }) => {
    if (threads.length === 0) {
        return (
            <div className="bg-slate-50 rounded-2xl p-12 text-center">
                <p className="text-slate-500 font-serif text-lg">No discussions yet.</p>
                <p className="text-slate-400 text-sm mt-2">Be the first to start a conversation!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {threads.map((thread) => (
                <div
                    key={thread.id}
                    onClick={() => onThreadClick(thread)}
                    className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md">
                                {thread.category}
                            </span>
                            {thread.tags.map(tag => (
                                <span key={tag} className="text-xs text-sky-600 font-medium">#{tag}</span>
                            ))}
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(thread.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="font-serif text-xl text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                        {thread.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                        {thread.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                            <img
                                src={thread.userAvatar || `https://i.pravatar.cc/150?u=${thread.userId}`}
                                alt={thread.userName}
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs font-medium text-slate-700">{thread.userName}</span>
                            {
                                thread.region && (
                                    <span className="text-xs text-slate-400">• {thread.region}</span>
                                )
                            }
                        </div >

                        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <MessageCircle className="w-4 h-4" />
                            <span>{thread.commentCount || 0} comments</span>
                        </div>
                    </div >
                </div >
            ))}
        </div >
    );
};

export default ThreadList;
