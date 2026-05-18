import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Chat, BadgeIcons, BadgeType } from "../types";
import { Link } from "react-router-dom";
import { Search, Plus, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

export default function Chats() {
  const { profile } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participantAuthIds", "array-contains", profile.id),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((doc) => {
        chatList.push({ id: doc.id, ...doc.data() } as Chat);
      });
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(search.toLowerCase()) || 
    chat.participants.some(p => p.includes(search))
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-10">
        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400">চ্যাট</h1>
        <div className="flex gap-2">
          <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ইউজার আইডি বা গ্রুপ নাম খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
            <p>আপনার কোনো চ্যাট নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors active:bg-gray-100 dark:active:bg-gray-800"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white dark:border-gray-800",
                    chat.type === 'group' ? "bg-orange-500" : "bg-blue-500"
                  )}>
                    {chat.type === 'group' ? <Users className="w-6 h-6" /> : chat.name?.[0] || chat.participants.find(p => p !== profile?.uid)?.[0]}
                  </div>
                  {/* Status Indicator (Always green for demo) */}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                      {chat.type === 'group' ? chat.name : `ইউজার: ${chat.participants.find(p => p !== profile?.uid)}`}
                    </h3>
                    {chat.lastMessageTime && (
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(chat.lastMessageTime.toDate(), { addSuffix: true, locale: bn })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage || "নতুন চ্যাট শুরু করুন..."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";
