
import React, { useState } from 'react';
import { Send, MoreVertical, Search, Phone, Video, ArrowRightLeft, Check, X, Library } from 'lucide-react';
import { Chat, Message, Translations } from '../types';
import { translations, mockChats } from '../data';

interface ChatInterfaceProps {
  lang: 'en' | 'ko';
  initialChatId?: string;
  chats: Chat[];
  onSendMessage: (chatId: string, text: string) => void;
  onAcceptProposal?: (chatId: string, messageId: string, proposalId: string) => void;
  onRejectProposal?: (chatId: string, messageId: string, proposalId: string) => void;
  onBrowseLibrary?: (partnerId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  lang,
  initialChatId,
  chats,
  onSendMessage,
  onAcceptProposal,
  onRejectProposal,
  onBrowseLibrary
}) => {
  const [activeChatId, setActiveChatId] = useState<string>(initialChatId || (chats.length > 0 ? chats[0].id : ''));
  const [inputText, setInputText] = useState('');
  const t = translations[lang];

  // Effect to update active chat if initialChatId changes
  React.useEffect(() => {
    if (initialChatId) {
      setActiveChatId(initialChatId);
    }
  }, [initialChatId]);

  const activeChat = chats.find(c => c.id === activeChatId) || (chats.length > 0 ? chats[0] : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;
    onSendMessage(activeChatId, inputText);
    setInputText('');
  };

  if (!activeChat) {
    return <div className="text-center py-20 text-slate-400">{t.noMessages}</div>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[700px]">

      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-50 border-r border-slate-100 flex flex-col">
        <div className="p-6">
          <h2 className="font-serif text-2xl text-slate-900 mb-6">{t.messages}</h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 ${activeChatId === chat.id
                  ? 'bg-white shadow-md shadow-slate-100 ring-1 ring-slate-100'
                  : 'hover:bg-slate-100'
                }`}
            >
              <div className="relative">
                <img
                  src={chat.partnerAvatar}
                  alt={chat.partnerName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`font-medium truncate ${activeChatId === chat.id ? 'text-slate-900' : 'text-slate-700'}`}>
                    {chat.partnerName}
                  </h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-20 border-b border-slate-50 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={activeChat.partnerAvatar} alt={activeChat.partnerName} className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-serif text-lg text-slate-900">{activeChat.partnerName}</h3>
              <p className="text-xs text-slate-400">{t.activeNow}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-sky-600 transition-colors"><Phone className="w-5 h-5" /></button>
            <button className="hover:text-sky-600 transition-colors"><Video className="w-5 h-5" /></button>
            <button className="hover:text-slate-900 transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {activeChat.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>

                {msg.proposal ? (
                  // Custom Card for Proposals
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 w-full max-w-sm">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                      <ArrowRightLeft className="w-4 h-4 text-sky-500" />
                      <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">{t.proposalTitle}</span>
                      <span className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${msg.proposal.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          msg.proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                        {msg.proposal.status}
                      </span>
                    </div>

                    {(msg.proposal as any).type === 'open' ? (
                      // Open Proposal (Let partner choose)
                      <div className="text-center py-2">
                        <div className="flex justify-center mb-3">
                          <div className="bg-sky-50 rounded-full p-3">
                            <Library className="w-6 h-6 text-sky-500" />
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          <span className="font-semibold text-slate-900">{msg.isMe ? 'You' : activeChat.partnerName}</span> {t.openProposalDesc} <span className="font-semibold text-slate-900">{msg.proposal.requested_book_title}</span>
                        </p>

                        {!msg.isMe && msg.proposal.status === 'pending' && (
                          <button
                            onClick={() => onBrowseLibrary?.(activeChat.partnerId)}
                            className="w-full py-2.5 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-100"
                          >
                            {t.browseLibrary}
                          </button>
                        )}
                      </div>
                    ) : (
                      // Direct Proposal (Specific book offered)
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-16 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">Book</div>
                          <div className="flex-1 text-center text-xs text-slate-400 px-2">
                            <ArrowRightLeft className="w-4 h-4 mx-auto mb-1" />
                          </div>
                          <div className="w-12 h-16 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">Book</div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          <span className="font-semibold text-slate-900">{msg.proposal.offered_book_title}</span> {t.proposalDesc} <span className="font-semibold text-slate-900">{msg.proposal.requested_book_title}</span>
                        </p>

                        {msg.proposal.status === 'pending' && !msg.isMe && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onAcceptProposal?.(activeChatId, msg.id, msg.proposal!.id)}
                              className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors"
                            >
                              {t.accept}
                            </button>
                            <button
                              onClick={() => onRejectProposal?.(activeChatId, msg.id, msg.proposal!.id)}
                              className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                            >
                              {t.decline}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {msg.proposal.status === 'accepted' && (
                      <div className="text-center text-emerald-600 text-xs font-bold uppercase tracking-wide py-2 bg-emerald-50 rounded-lg mt-2">
                        {t.accepted}
                      </div>
                    )}

                    {msg.proposal.status === 'declined' && (
                      <div className="text-center text-slate-400 text-xs font-bold uppercase tracking-wide py-2 bg-slate-50 rounded-lg mt-2">
                        {t.rejected}
                      </div>
                    )}
                  </div>
                ) : (
                  // Standard Text Message
                  <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isMe
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                )}
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-50">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-200 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.typeMessage}
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-slate-700 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;