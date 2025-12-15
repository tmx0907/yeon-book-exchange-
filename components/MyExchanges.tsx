import React, { useState, useEffect } from 'react';
import { ExchangeProposal, Language } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Clock, CheckCircle, XCircle, Send, Inbox, ArrowRight } from 'lucide-react';

interface MyExchangesProps {
    lang: Language;
    userId: string;
    onAcceptProposal: (proposalId: string) => void;
    onDeclineProposal: (proposalId: string, reason?: string) => void;
    onCancelProposal: (proposalId: string) => void;
}

const MyExchanges: React.FC<MyExchangesProps> = ({
    lang,
    userId,
    onAcceptProposal,
    onDeclineProposal,
    onCancelProposal
}) => {
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
    const [sentProposals, setSentProposals] = useState<ExchangeProposal[]>([]);
    const [receivedProposals, setReceivedProposals] = useState<ExchangeProposal[]>([]);
    const [loading, setLoading] = useState(true);

    const t = {
        en: {
            title: 'My Exchange Proposals',
            sent: 'Sent',
            received: 'Received',
            pending: 'Pending',
            accepted: 'Accepted',
            declined: 'Declined',
            cancelled: 'Cancelled',
            you_want: 'You want',
            you_offer: 'You offered',
            they_want: 'They want',
            they_offer: 'They offered',
            to: 'to',
            from: 'from',
            accept: 'Accept',
            decline: 'Decline',
            cancel: 'Cancel',
            view: 'View',
            message: 'Message',
            no_proposals: 'No proposals yet',
            sent_desc: 'Proposals you sent to others',
            received_desc: 'Proposals you received from others'
        },
        ko: {
            title: '나의 교환 제안',
            sent: '보낸 제안',
            received: '받은 제안',
            pending: '대기중',
            accepted: '수락됨',
            declined: '거절됨',
            cancelled: '취소됨',
            you_want: '원하는 책',
            you_offer: '제공할 책',
            they_want: '원하는 책',
            they_offer: '제공할 책',
            to: '에게',
            from: '으로부터',
            accept: '수락',
            decline: '거절',
            cancel: '취소',
            view: '보기',
            message: '메시지',
            no_proposals: '제안이 없습니다',
            sent_desc: '다른 사용자에게 보낸 제안',
            received_desc: '다른 사용자로부터 받은 제안'
        }
    };

    const translations = t[lang];

    useEffect(() => {
        fetchProposals();

        // Realtime subscription
        const channel = supabase
            .channel('my_proposals')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'exchange_proposals',
                filter: `requester_id=eq.${userId}`
            }, () => {
                fetchProposals();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'exchange_proposals',
                filter: `receiver_id=eq.${userId}`
            }, () => {
                fetchProposals();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const fetchProposals = async () => {
        setLoading(true);

        // Fetch sent proposals
        const { data: sent } = await supabase
            .from('exchange_proposals')
            .select('*')
            .eq('requester_id', userId)
            .order('created_at', { ascending: false });

        // Fetch received proposals
        const { data: received } = await supabase
            .from('exchange_proposals')
            .select('*')
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false });

        setSentProposals(sent || []);
        setReceivedProposals(received || []);
        setLoading(false);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: {
                icon: <Clock className="w-4 h-4" />,
                color: 'bg-amber-100 text-amber-800',
                text: translations.pending
            },
            accepted: {
                icon: <CheckCircle className="w-4 h-4" />,
                color: 'bg-green-100 text-green-800',
                text: translations.accepted
            },
            declined: {
                icon: <XCircle className="w-4 h-4" />,
                color: 'bg-red-100 text-red-800',
                text: translations.declined
            },
            cancelled: {
                icon: <XCircle className="w-4 h-4" />,
                color: 'bg-gray-100 text-gray-800',
                text: translations.cancelled
            }
        };

        const badge = badges[status as keyof typeof badges] || badges.pending;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                {badge.icon}
                {badge.text}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return lang === 'ko' ? '방금 전' : 'Just now';
        if (hours < 24) return lang === 'ko' ? `${hours}시간 전` : `${hours}h ago`;
        if (days < 7) return lang === 'ko' ? `${days}일 전` : `${days}d ago`;
        return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US');
    };

    const ProposalCard = ({ proposal, isSent }: { proposal: ExchangeProposal; isSent: boolean }) => (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSent ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {isSent ? <Send className="w-5 h-5 text-blue-600" /> : <Inbox className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">
                            {isSent ? translations.to : translations.from} {isSent ? proposal.receiver_name : proposal.requester_name}
                        </p>
                        <p className="text-sm text-slate-500">{formatDate(proposal.created_at)}</p>
                    </div>
                </div>
                {getStatusBadge(proposal.status)}
            </div>

            {/* Books */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        {isSent ? translations.you_want : translations.they_want}
                    </p>
                    <p className="font-medium text-slate-900">{proposal.requested_book_title}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        {isSent ? translations.you_offer : translations.they_offer}
                    </p>
                    <p className="font-medium text-slate-900">{proposal.offered_book_title}</p>
                </div>
            </div>

            {/* Message */}
            {proposal.message && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                    <p className="text-sm text-slate-700 italic">"{proposal.message}"</p>
                </div>
            )}

            {/* Actions */}
            {proposal.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                    {!isSent ? (
                        <>
                            <button
                                onClick={() => onAcceptProposal(proposal.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                {translations.accept}
                            </button>
                            <button
                                onClick={() => {
                                    const reason = prompt(lang === 'ko' ? '거절 사유 (선택사항):' : 'Decline reason (optional):');
                                    onDeclineProposal(proposal.id, reason || undefined);
                                }}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                {translations.decline}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                if (confirm(lang === 'ko' ? '제안을 취소하시겠습니까?' : 'Cancel this proposal?')) {
                                    onCancelProposal(proposal.id);
                                }
                            }}
                            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {translations.cancel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    const currentProposals = activeTab === 'sent' ? sentProposals : receivedProposals;
    const pendingCount = currentProposals.filter(p => p.status === 'pending').length;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{translations.title}</h1>
                <p className="text-slate-600">
                    {activeTab === 'sent' ? translations.sent_desc : translations.received_desc}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'received'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    {translations.received}
                    {receivedProposals.filter(p => p.status === 'pending').length > 0 && (
                        <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {receivedProposals.filter(p => p.status === 'pending').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'sent'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    {translations.sent}
                    {sentProposals.filter(p => p.status === 'pending').length > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {sentProposals.filter(p => p.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : currentProposals.length === 0 ? (
                <div className="text-center py-20">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${activeTab === 'sent' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                        {activeTab === 'sent' ? <Send className="w-8 h-8 text-blue-600" /> : <Inbox className="w-8 h-8 text-purple-600" />}
                    </div>
                    <p className="text-slate-500 text-lg">{translations.no_proposals}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {currentProposals.map(proposal => (
                        <ProposalCard key={proposal.id} proposal={proposal} isSent={activeTab === 'sent'} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyExchanges;
