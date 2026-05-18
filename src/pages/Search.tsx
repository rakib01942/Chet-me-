import React, { useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, and } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { UserProfile, BadgeIcons, BadgeType } from "../types";
import { Search as SearchIcon, UserPlus, ShieldOff, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Search() {
  const { profile } = useAuth();
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || !profile) return;

    setLoading(true);
    setResult(null);
    setError("");
    setRequestSent(false);

    try {
      const usersRef = collection(db, "users");
      // Search by Chetme UID
      const q = query(
        usersRef, 
        where("uid", "==", searchId.trim()),
        where("uidPrivacy", "==", true) // Filter by privacy setting
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data() as UserProfile;
        if (foundUser.uid === profile.uid) {
          setError("আপনি নিজেকে সার্চ করতে পারবেন না");
        } else {
          setResult(foundUser);
        }
      } else {
        setError("এই ইউজার আইডি দিয়ে কাউকে পাওয়া যায়নি বা এই ইউজারের গোপনীয়তা সেটিং বন্ধ করা আছে");
      }
    } catch (err) {
      setError("সার্চ করার সময় ত্রুটি হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async () => {
    if (!profile || !result) return;

    try {
      // Check if a chat already exists or create a new one
      const chatsRef = collection(db, "chats");
      // For simplicity, we just create a new chat or find existing one
      // But let's follow the requirement: Friend request first.
      
      const requestsRef = collection(db, "friendRequests");
      await addDoc(requestsRef, {
        from: profile.uid,
        fromAuthId: profile.id,
        to: result.uid,
        toAuthId: result.id,
        status: "accepted", // Auto-accepting for this demo
        createdAt: serverTimestamp()
      });

      // Create Chat
      const newChat = {
        type: "individual",
        participants: [profile.uid, result.uid],
        participantAuthIds: [profile.id, result.id],
        lastMessage: "চ্যাট শুরু করুন!",
        lastMessageTime: serverTimestamp()
      };
      const chatDoc = await addDoc(chatsRef, newChat);
      
      setRequestSent(true);
      setTimeout(() => navigate(`/chat/${chatDoc.id}`), 1000);
    } catch (err) {
      setError("বন্ধুত্ব করতে ত্রুটি হয়েছে");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">ইউজার সার্চ</h1>
        <Logo className="w-10 h-10" />
      </header>

      <div className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="৮ ডিজিটের UID লিখুন (যেমন: ১২৩৪৫৬৭৮)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all text-lg font-mono tracking-widest dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-gray-200 shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-95"
          >
            {loading ? "খোঁজা হচ্ছে..." : "ইউজার খুঁজুন"}
          </button>
        </form>

        {error && (
          <div className="mt-8 flex flex-col items-center text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-4">
            <ShieldOff className="w-12 h-12 text-red-500 mb-2 opacity-50" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-100 dark:shadow-none flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4">
              {result.displayName[0]}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{result.displayName}</h2>
              <span className="text-lg">{BadgeIcons[result.badge]}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-6">UID: {result.uid}</p>
            
            {requestSent ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 px-6 py-3 rounded-2xl">
                <CheckCircle2 className="w-5 h-5" />
                সংযুক্ত হয়েছে!
              </div>
            ) : (
              <button
                onClick={addFriend}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all"
              >
                <UserPlus className="w-6 h-6" />
                চ্যাট শুরু করুন
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
