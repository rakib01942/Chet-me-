import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import { LogOut, Phone, ShieldAlert, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

export default function BanScreen({ type }: { type: "temporary" | "permanent" }) {
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (type === "temporary" && profile?.bannedUntil) {
      const interval = setInterval(() => {
        const remaining = formatDistanceToNow(profile.bannedUntil!.toDate(), { addSuffix: true, locale: bn });
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type, profile]);

  const handleLogout = () => auth.signOut();

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 z-[100] flex flex-col items-center justify-center p-8 text-center">
      <div className={`p-6 rounded-full mb-8 ${type === "permanent" ? "bg-red-100 dark:bg-red-950/30 text-red-600" : "bg-orange-100 dark:bg-orange-950/30 text-orange-600"}`}>
        <ShieldAlert className="w-16 h-16" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
        {type === "permanent" ? "অ্যাকাউন্ট ব্যান করা হয়েছে!" : "অ্যাকাউন্ট সাময়িকভাবে স্থগিত!"}
      </h1>

      <div className="max-w-md bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 mb-8 shadow-sm">
        {type === "permanent" ? (
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            ❌ Chetme-এর নিরাপত্তা ও নিয়মাবলী অমান্য করায় আপনার আইডিটি স্থায়ীভাবে ব্যান বা ডিলিট করা হয়েছে। বিস্তারিত জানতে নিচের হেল্পলাইন বাটনে ক্লিক করে যোগাযোগ করুন।
          </p>
        ) : (
          <div className="space-y-4">
             <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              ⏳ Chetme-এর নিয়মাবলী আংশিক লঙ্ঘন করায় আপনার আইডিটি সাময়িকভাবে ব্যান করা হয়েছে।
            </p>
            <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400 font-black text-xl py-3 px-6 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-100 dark:border-orange-800/50">
               <Clock className="w-6 h-6" />
               {timeLeft}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <a
          href="https://wa.me/8801886039719?text=আমি Chet me wab থেকে সাহায্যের জন্য আসছি"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Phone className="w-6 h-6" />
          হেল্পলাইন
        </a>

        <button
          onClick={handleLogout}
          className="text-gray-400 font-bold hover:text-gray-600 p-4 transition-colors text-sm"
        >
          লগ-আউট করুন
        </button>
      </div>

      <p className="mt-auto text-[10px] text-gray-400 font-black uppercase tracking-widest">Chetme Security Systems</p>
    </div>
  );
}
