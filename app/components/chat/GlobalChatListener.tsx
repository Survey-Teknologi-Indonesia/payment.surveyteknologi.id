"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { getCurrentUserId, getChatContacts, getUserConversations } from "@/app/lib/actions/chatActions";
import { X, MessageSquare } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface ChatNotification {
  id: string;
  senderName: string;
  message: string;
}

export default function GlobalChatListener() {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    let channel: any;
    
    async function initListener() {
      const userId = await getCurrentUserId();
      if (!isMounted || !userId) return;

      const [contactsRes, convosRes] = await Promise.all([
        getChatContacts(),
        getUserConversations()
      ]);

      if (!isMounted) return;

      const contacts = contactsRes.success ? contactsRes.data || [] : [];
      const myConvos = new Set(convosRes.success ? convosRes.data || [] : []);

      // Listen to all inserts in messages
      channel = supabase
        .channel('global_messages_listener')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const newMsg = payload.new;
            
            // Dispatch event for chat page
            window.dispatchEvent(new CustomEvent("new_chat_message", { detail: newMsg }));

            // Jika pesan berada dalam daftar obrolan kita, dan kita bukan pengirimnya
            if (myConvos.has(newMsg.conversation_id) && newMsg.sender_id !== userId) {
              
              // Jika user sedang berada di halaman chat, jangan tampilkan notifikasi mengambang ini
              // (karena mereka sudah melihat pesannya secara langsung)
              if (window.location.pathname.startsWith("/dashboard/chat")) {
                return;
              }

              const sender = contacts.find((c: any) => c.account_id === newMsg.sender_id);
              const senderName = sender ? sender.name : "Rekan Kerja";
              
              const newNotif = {
                id: newMsg.id || Math.random().toString(),
                senderName,
                message: newMsg.message
              };

              setNotifications(prev => [...prev, newNotif]);
              
              // Auto dismiss after 5 seconds
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
              }, 5000);
            }
          }
        )
        .subscribe();
    }

    initListener();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []); // Remove pathname from dependencies to avoid recreating the channel every navigation

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    router.push("/dashboard/chat");
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          onClick={() => handleNotificationClick(notif.id)}
          className="pointer-events-auto cursor-pointer w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex gap-4 items-start animate-in fade-in slide-in-from-right-8 duration-300 relative overflow-hidden group hover:border-brand-cyan/50 transition-colors"
        >
          {/* Subtle gradient background like Windows 11 notifications */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent pointer-events-none" />
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 z-10">
            <MessageSquare className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0 z-10 mt-0.5">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {notif.senderName}
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {notif.message}
            </p>
          </div>

          <button
            onClick={(e) => dismissNotification(notif.id, e)}
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
