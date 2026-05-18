import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { collection, query, getDocs, updateDoc, doc, addDoc, serverTimestamp, where, setDoc, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile, BadgeType, BadgeIcons, Chat, Message } from "../types";
import { Shield, Users, Megaphone, Ban, Trash2, Award, ChevronRight, MessageSquare, Eye } from "lucide-react";
import { addHours, addDays } from "date-fns";

export default function Admin() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "notices" | "logs" | "chats" | "seed">("users");
  const [noticeData, setNoticeData] = useState({ 
    title: "", 
    body: "", 
    type: "global" as "global" | "targeted", 
    targetUids: "",
    imageUrl: "",
    link: ""
  });

  useEffect(() => {
    if (profile?.badge === BadgeType.ADMIN) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile)));
      };
      
      const fetchChats = async () => {
        const snap = await getDocs(query(collection(db, "chats"), orderBy("lastMessageTime", "desc"), limit(50)));
        setAllChats(snap.docs.map(d => ({ id: d.id, ...d.data() } as Chat)));
      };

      fetchUsers();
      fetchChats();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedChat) {
      const q = query(collection(db, "chats", selectedChat, "messages"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snap) => {
        setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);

  if (profile?.badge !== BadgeType.ADMIN) {
    const isAdminEmail = profile?.email === "mf460854@gmail.com" || profile?.email === "mdfaruq0194@gmail.com";
    if (isAdminEmail) {
       return (
         <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-900 font-black mb-2">আপনার অ্যাডমিন লগইন যাচাই করা হচ্ছে...</p>
           <p className="text-gray-500 text-xs font-medium">সবুজ এডমিন ব্যাজ পেতে কয়েক সেকেন্ড সময় লাগতে পারে।</p>
         </div>
       );
    }
    return <Navigate to="/" />;
  }

  const handleBan = async (userId: string, hours: number) => {
    const banDate = hours === -1 ? null : addHours(new Date(), hours);
    await updateDoc(doc(db, "users", userId), {
      bannedUntil: banDate,
      isPermanentlyBanned: hours === -1,
      badge: BadgeType.WARNING
    });
    alert("ইউজার ব্যান করা হয়েছে");
  };

  const handleGiveBadge = async (userId: string, badge: BadgeType) => {
    await updateDoc(doc(db, "users", userId), { badge });
    alert(`অ্যাসাইন করা হয়েছে: ${badge}`);
  };

  const handleSendNotice = async () => {
    const data: any = {
      title: noticeData.title,
      body: noticeData.body,
      type: noticeData.type,
      createdAt: serverTimestamp(),
      isActive: true
    };

    if (noticeData.imageUrl) data.imageUrl = noticeData.imageUrl;
    if (noticeData.link) data.link = noticeData.link;

    if (noticeData.type === "targeted") {
      data.targetUids = noticeData.targetUids.split(",").map(u => u.trim()).filter(u => u.length > 0);
    }

    await addDoc(collection(db, "notices"), data);
    alert("নোটিশ পাঠানো হয়েছে");
    setNoticeData({ title: "", body: "", type: "global", targetUids: "", imageUrl: "", link: "" });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col font-sans">
      <header className="bg-white p-6 shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-xl text-red-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Chetme Central Command</p>
          </div>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="flex bg-white overflow-x-auto border-b border-gray-100 px-4">
        {[
          { id: "users", icon: Users, label: "ইউজার লিস্ট" },
          { id: "chats", icon: MessageSquare, label: "চ্যাট মডারেশন" },
          { id: "notices", icon: Megaphone, label: "নোটিশ ব্রডকাস্টিং" },
          { id: "logs", icon: Ban, label: "অ্যাক্টিভিটি লগ" },
          { id: "seed", icon: Shield, label: "ডেমো ডাটা" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {activeTab === "chats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
            {/* Chat List */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-y-auto">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-black text-sm">সব চ্যাট ({allChats.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {allChats.map(chat => (
                  <button 
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      selectedChat === chat.id ? "bg-blue-50 border-r-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black">
                      {chat.type === 'group' ? "G" : "P"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate">{chat.id}</p>
                      <p className="text-[10px] text-gray-400 truncate">{chat.lastMessage || "No message"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Viewer */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden">
              {selectedChat ? (
                <>
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <h2 className="font-black text-sm">চ্যাট পর্যবেক্ষণ: {selectedChat}</h2>
                    </div>
                    <button onClick={() => setSelectedChat(null)} className="text-xs font-bold text-red-500">বন্ধ করুন</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 text-sm">কোনো মেসেজ নেই</div>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-blue-600">UID: {msg.senderId}</span>
                            <span className="text-[9px] text-gray-400">
                              {msg.createdAt?.toDate().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 leading-relaxed font-medium">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 bg-red-50 border-t border-red-100">
                     <p className="text-[10px] text-red-600 font-black text-center uppercase tracking-widest">
                       ⚠️ মডারেশন মোড: মেসেজ ডিলিট বা এডিট করার ক্ষমতা শীঘ্রই যোগ করা হবে।
                     </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                  <div className="p-6 bg-gray-50 rounded-full mb-4">
                    <Eye className="w-12 h-12 opacity-20" />
                  </div>
                  <p className="font-bold">বাম পাশ থেকে একটি চ্যাট সিলেক্ট করুন</p>
                  <p className="text-xs mt-2">মডারেশনের জন্য সব চ্যাট মেসেজ এখানে দেখা যাবে।</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "seed" && (
          <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center flex flex-col items-center">
             <Shield className="w-16 h-16 text-blue-600 mb-4" />
             <h2 className="text-xl font-black mb-2">ডেমো ইউজার জেনারেটর</h2>
             <p className="text-gray-500 mb-6 font-medium">টেস্টিং এর জন্য ৩টি ফেক আইডি (Sakib, Ayesha, Support) ডাটাবেসে যোগ করুন।</p>
             <button
               onClick={async () => {
                 const fakeUsers = [
                   { id: "demo1", uid: "10000001", displayName: "Sakib Khan", email: "sakib@demo.com", badge: BadgeType.VERIFIED, bio: "Verified Actor", gender: "পুরুষ", age: 28 },
                   { id: "demo2", uid: "20000002", displayName: "Ayesha Rahman", email: "ayesha@demo.com", badge: BadgeType.VIP, bio: "Digital Creator", gender: "নারী", age: 22 },
                   { id: "demo3", uid: "99999999", displayName: "Chetme Support", email: "support@chetme.com", badge: BadgeType.EMPLOYEE, bio: "Help Desk", gender: "অন্যান্য", age: 30 }
                 ];
                 for (const u of fakeUsers) {
                   await setDoc(doc(db, "users", u.id), {
                     ...u,
                     phone: "+8801700000000",
                     isPublic: true,
                     uidPrivacy: true,
                     createdAt: serverTimestamp(),
                     lastSeen: serverTimestamp(),
                     isPermanentlyBanned: false,
                     bannedUntil: null
                   });
                 }
                 alert("৩টি ডেমো আইডি সফলভাবে যোগ করা হয়েছে!");
               }}
               className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
             >
               এখনই ডেমো ডাটা যোগ করুন
             </button>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl font-black border border-gray-100 shadow-inner">
                    {u.displayName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-gray-900">{u.displayName}</h3>
                      <span>{BadgeIcons[u.badge]}</span>
                    </div>
                    <p className="text-xs text-blue-600 font-mono font-bold tracking-wider">UID: {u.uid}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                   <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-black text-gray-400 uppercase">ব্যাজ পরিবর্তন</span>
                     <div className="flex gap-1.5 flex-wrap">
                        {Object.values(BadgeType).map(b => (
                          <button
                            key={b}
                            onClick={() => handleGiveBadge(u.id, b)}
                            className={`p-2 rounded-xl border transition-all hover:scale-110 active:scale-95 ${
                              u.badge === b ? "bg-gray-100 border-gray-300" : "bg-white border-gray-100"
                            }`}
                            title={b}
                          >
                            {BadgeIcons[b]}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-black text-gray-400 uppercase">অ্যাকশন</span>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleBan(u.id, 24)} 
                          className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-black border border-orange-100"
                        >
                          ২৪ ঘণ্টা ব্যান
                        </button>
                        <button 
                          onClick={() => handleBan(u.id, -1)} 
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black border border-red-100"
                        >
                           পারমানেন্ট ব্যান
                        </button>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "notices" && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100">
             <h2 className="text-xl font-black mb-6 flex items-center gap-2">
               <Megaphone className="w-6 h-6 text-blue-600" />
               নোটিশ ব্রডকাস্টিং এবং টার্গেটিং
             </h2>
             <div className="space-y-6">
                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase mb-2">নোটিশের ধরণ</label>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setNoticeData({ ...noticeData, type: "global" })}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
                          noticeData.type === "global" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"
                        }`}
                      >
                        গ্লোবাল (সবার জন্য)
                      </button>
                      <button 
                        onClick={() => setNoticeData({ ...noticeData, type: "targeted" })}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
                          noticeData.type === "targeted" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"
                        }`}
                      >
                        টার্গেটেড (নির্দিষ্ট UID)
                      </button>
                   </div>
                </div>

                {noticeData.type === "targeted" && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">টার্গেট UID সমূহ (কমা দিয়ে লিখুন)</label>
                    <input
                      type="text"
                      value={noticeData.targetUids}
                      onChange={(e) => setNoticeData({ ...noticeData, targetUids: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 font-mono"
                      placeholder="১২৩৪৫৬৭৮, ৯৮৭৬৫৪৩২"
                    />
                  </div>
                )}

                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase mb-2">নোটিশের শিরোনাম</label>
                   <input
                     type="text"
                     value={noticeData.title}
                     onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                     className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 font-bold"
                     placeholder="যেমন: জরুরি রক্ষণাবেক্ষণ"
                   />
                </div>
                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase mb-2">বিস্তারিত তথ্য</label>
                   <textarea
                     value={noticeData.body}
                     onChange={(e) => setNoticeData({ ...noticeData, body: e.target.value })}
                     className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-500 font-medium min-h-[150px]"
                     placeholder="এখানে বিস্তারিত লিখুন..."
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">ইমেজ ইউআরএল (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={noticeData.imageUrl}
                      onChange={(e) => setNoticeData({ ...noticeData, imageUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">এক্সটার্নাল লিঙ্ক (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={noticeData.link}
                      onChange={(e) => setNoticeData({ ...noticeData, link: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://example.com/more-info"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendNotice}
                  disabled={!noticeData.title || !noticeData.body || (noticeData.type === "targeted" && !noticeData.targetUids)}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  {noticeData.type === "global" ? "গ্লোবাল ব্রডকাস্ট করুন" : "টার্গেটেড নোটিশ পাঠান"}
                </button>
             </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center flex flex-col items-center">
             <Ban className="w-16 h-16 text-gray-200 mb-4" />
             <p className="text-gray-500 font-bold">অ্যাক্টিভিটি লগ শীঘ্রই আসছে...</p>
          </div>
        )}
      </main>
    </div>
  );
}
