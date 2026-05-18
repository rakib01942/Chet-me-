import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Message, Chat, UserProfile, BadgeType } from "../types";
import { Send, ChevronLeft, Phone, MoreVertical, ShieldAlert } from "lucide-react";
import { formatTime } from "../lib/utils";

export default function ChatDetail() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !profile) return;

    // Fetch Chat Meta
    const chatRef = doc(db, "chats", chatId);
    const unsubscribeChat = onSnapshot(chatRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Chat;
        setChatInfo(data);

        // Fetch Recipient Profile if individual
        if (data.type === "individual") {
          const otherUid = data.participants.find(p => p !== profile.uid);
          // This requires UID mapping or storing AuthID in Chat.participants
          // For simplicity, let's assume we find the other participant's profile
          const otherAuthId = data.participantAuthIds.find(id => id !== profile.id);
          if (otherAuthId) {
            const otherSnap = await getDoc(doc(db, "users", otherAuthId));
            if (otherSnap.exists()) setRecipient(otherSnap.data() as UserProfile);
          }
        }
      }
    });

    // Fetch Messages
    const msgsRef = collection(db, "chats", chatId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));
    const unsubscribeMsgs = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      
      // Check message limit (3 for unknowns)
      if (profile.badge === BadgeType.NORMAL || profile.badge === BadgeType.WARNING) {
        const userMsgs = msgs.filter(m => m.senderId === profile.uid);
        const recipientResponded = msgs.some(m => m.senderId !== profile.uid);
        if (userMsgs.length >= 3 && !recipientResponded) {
          setMessageLimitReached(true);
        } else {
          setMessageLimitReached(false);
        }
      }
    });

    return () => {
      unsubscribeChat();
      unsubscribeMsgs();
    };
  }, [chatId, profile]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId || !profile || messageLimitReached) return;

    const messageData = {
      senderId: profile.uid,
      senderAuthId: profile.id,
      text: inputText,
      type: "text",
      createdAt: serverTimestamp(),
      readBy: []
    };

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), messageData);
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: inputText,
        lastMessageTime: serverTimestamp()
      });
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-3 h-16 flex items-center justify-between z-10 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {recipient?.displayName?.[0] || chatInfo?.name?.[0] || "?"}
            </div>
            <div>
              <h2 className="font-bold text-sm truncate max-w-[120px]">
                {chatInfo?.type === "group" ? chatInfo.name : recipient?.displayName || "লোডিং..."}
              </h2>
              <p className="text-[10px] text-green-500 font-medium">অনলাইন</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center py-4">
          <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium flex items-center justify-center w-fit mx-auto gap-1">
            <ShieldAlert className="w-3 h-3" />
            এন্ড-টু-এন্ড এনক্রিপ্টেড
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === profile?.uid ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
              msg.senderId === profile?.uid 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className={`text-[9px] mt-1 flex items-center gap-1 ${
                msg.senderId === profile?.uid ? "text-blue-100 justify-end" : "text-gray-400"
              }`}>
                {msg.createdAt && formatTime(msg.createdAt.toDate())}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 pb-8">
        {messageLimitReached ? (
          <div className="text-center p-3 bg-red-50 text-red-600 rounded-xl text-xs flex flex-col items-center gap-1 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <p className="font-bold">🚫 মেসেজ সীমা শেষ!</p>
            <p>আপনি এই ব্যবহারকারীকে সর্বোচ্চ ৩টি মেসেজ পাঠিয়েছেন। অপর প্রান্ত থেকে উত্তর না দেওয়া পর্যন্ত আর মেসেজ পাঠানো যাবে না।</p>
          </div>
        ) : (
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="মেসেজ লিখুন..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-lg active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
