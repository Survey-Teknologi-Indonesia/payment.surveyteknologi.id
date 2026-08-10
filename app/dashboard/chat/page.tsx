"use client";

import React, { useEffect, useState, useRef } from "react";
import { getChatContacts, getOrCreateConversation, getMessages, sendMessage, getCurrentUserId, getLatestMessagesPerContact, markConversationAsRead } from "../../lib/actions/chatActions";
import { supabase } from "../../lib/supabaseClient";
import { Search, Send, User, Clock, CheckCircle2 } from "lucide-react";

export default function ChatPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [latestMessages, setLatestMessages] = useState<Record<string, any>>({});
  const [contactToConvo, setContactToConvo] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId || null);

      const [res, latestRes] = await Promise.all([
        getChatContacts(),
        getLatestMessagesPerContact()
      ]);
      
      if (res.success) {
        setContacts(res.data || []);
      }
      if (latestRes.success) {
        setLatestMessages(latestRes.data || {});
        setContactToConvo(latestRes.contactToConvo || {});
      }
      setIsLoading(false);
    }
    init();

    const handlePresence = (e: Event) => {
      const customEvent = e as CustomEvent<Set<string>>;
      setOnlineUsers(customEvent.detail);
    };

    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const newMsg = customEvent.detail;
      
      setContactToConvo(prevMap => {
        const contactId = Object.keys(prevMap).find(k => prevMap[k] === newMsg.conversation_id);
        if (contactId) {
          setLatestMessages(prev => ({
            ...prev,
            [contactId]: newMsg
          }));
        }
        return prevMap;
      });
    };

    window.addEventListener("presence_sync", handlePresence);
    window.addEventListener("new_chat_message", handleNewMessage);

    return () => {
      window.removeEventListener("presence_sync", handlePresence);
      window.removeEventListener("new_chat_message", handleNewMessage);
    };
  }, []);

  const formatLastSeen = (dateString: string | null) => {
    if (!dateString) return "Offline";
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Hari ini ${timeStr}`;
    if (isYesterday) return `Kemarin ${timeStr}`;
    
    return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${timeStr}`;
  };

  // When a contact is selected, fetch/create conversation and load messages
  useEffect(() => {
    if (!selectedContact) return;

    let isMounted = true;
    let subscription: any = null;

    async function loadChat() {
      const convoRes = await getOrCreateConversation(selectedContact.account_id);
      
      if (convoRes.success && isMounted) {
        setActiveConversationId(convoRes.conversationId);
        
        // Update convo map and mark as read
        setContactToConvo(prev => ({...prev, [selectedContact.account_id]: convoRes.conversationId}));
        await markConversationAsRead(convoRes.conversationId);
        window.dispatchEvent(new Event("chat_read"));
        
        setLatestMessages(prev => ({
          ...prev,
          [selectedContact.account_id]: { ...prev[selectedContact.account_id], is_read: true }
        }));
        
        const msgRes = await getMessages(convoRes.conversationId);
        if (msgRes.success) {
          setMessages(msgRes.data || []);
          scrollToBottom();
        }

        // Subscribe to real-time changes
        subscription = supabase
          .channel(`chat_${convoRes.conversationId}`)
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'messages',
              filter: `conversation_id=eq.${convoRes.conversationId}` 
            },
            (payload) => {
              setMessages((prev) => [...prev, payload.new]);
              scrollToBottom();
            }
          )
          .subscribe();
      }
    }

    loadChat();

    return () => {
      isMounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [selectedContact]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const msg = newMessage;
    setNewMessage(""); // Optimistic clear

    await sendMessage(activeConversationId, msg);
    // Realtime subscription will append the message automatically
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-50/50 ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cyan"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(80vh)] bg-slate-50/50 lg:gap-6 overflow-hidden ">
      
      {/* LEFT COLUMN: Contacts */}
      <div className={`w-full lg:w-1/3 max-w-sm flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Contact Header & Search */}
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <a href="/dashboard/projects" className="text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <span className="text-xl">←</span>
            </a>
            <h2 className="text-lg font-bold text-slate-900">Direct Messages</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari rekan kerja..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map((contact) => (
            <button
              key={contact.account_id}
              onClick={async () => {
                setSelectedContact(contact);
                const convoId = contactToConvo[contact.account_id];
                if (convoId) {
                  await markConversationAsRead(convoId);
                  window.dispatchEvent(new Event("chat_read"));
                  setLatestMessages(prev => {
                    if (prev[contact.account_id]) {
                      return {
                        ...prev,
                        [contact.account_id]: { ...prev[contact.account_id], is_read: true }
                      };
                    }
                    return prev;
                  });
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                selectedContact?.account_id === contact.account_id 
                  ? "bg-brand-cyan/10 border border-brand-cyan/20" 
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {contact.name.substring(0, 2).toUpperCase()}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${onlineUsers.has(contact.account_id) ? 'bg-emerald-400' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{contact.name}</p>
                {latestMessages[contact.account_id] ? (
                  <p className={`text-[13px] truncate ${
                    latestMessages[contact.account_id].sender_id !== currentUserId && !latestMessages[contact.account_id].is_read 
                      ? 'font-bold text-slate-900' 
                      : 'text-slate-500'
                  }`}>
                    {latestMessages[contact.account_id].sender_id === currentUserId ? 'Anda: ' : ''}
                    {latestMessages[contact.account_id].message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 truncate capitalize">
                    {onlineUsers.has(contact.account_id) ? 'Online' : contact.jabatan}
                  </p>
                )}
              </div>
            </button>
          ))}
          {contacts.length === 0 && (
            <div className="text-center p-4 text-slate-500 text-sm">
              Tidak ada rekan kerja ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Room */}
      <div className={`flex-1 flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${selectedContact ? 'flex' : 'hidden lg:flex'}`}>
        
        {selectedContact ? (
          <>
            {/* Chat Room Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white z-10 shadow-sm">
              <button 
                onClick={() => setSelectedContact(null)}
                className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
              >
                <span className="text-xl">←</span>
              </button>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {selectedContact.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{selectedContact.name}</h3>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {onlineUsers.has(selectedContact.account_id) ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-emerald-500">Online</span>
                    </>
                  ) : (
                    <span className="text-slate-500">
                      Offline - Last seen: {formatLastSeen(selectedContact.last_seen)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUserId;
                const date = new Date(msg.created_at);
                const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                          isMe 
                            ? 'bg-gradient-to-br from-brand-cyan to-blue-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 px-1">
                        <span>{time}</span>
                        {isMe && <CheckCircle2 className="w-3 h-3 text-brand-cyan" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm">Belum ada pesan. Mulai obrolan dengan {selectedContact.name}!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-lg shadow-sm shadow-brand-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shadow-inner">
              <Send className="w-8 h-8 text-slate-300 ml-1" />
            </div>
            <div className="text-center">
              <h3 className="text-slate-900 font-bold mb-1">Pilih Rekan Kerja</h3>
              <p className="text-sm">Mulai obrolan langsung secara real-time</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}