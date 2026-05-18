import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Shield, Moon, Sun, Lock, UserX, ChevronRight, EyeOff, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Settings() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, profile.email);
      alert(`${profile.email} এড্রেসে একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে।`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const toggleUidPrivacy = async () => {
    if (!profile) return;
    await updateDoc(doc(db, "users", profile.id), {
      uidPrivacy: !profile.uidPrivacy
    });
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    if (confirm("আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট ডিলিট করতে চান? আপনার সব ডাটা মুছে যাবে!")) {
      await deleteDoc(doc(db, "users", profile.id));
      await auth.currentUser?.delete();
      navigate("/login");
    }
  };

  if (!profile) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-full">
      <header className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <ChevronRight className="rotate-180 w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">সেটিংস</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* Privacy Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest px-2">সিকিউরিটি ও প্রাইভেসী</h2>
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800 shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                  profile.uidPrivacy ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                )}>
                  {profile.uidPrivacy ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-gray-200">UID গোপনীয়তা</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">খোঁজ করার ক্ষমতা নিয়ন্ত্রণ করুন</p>
                </div>
              </div>
              <button 
                onClick={toggleUidPrivacy}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-300",
                  profile.uidPrivacy ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                  profile.uidPrivacy ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <button 
              onClick={handlePasswordReset}
              className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-gray-200">পাসওয়ার্ড পরিবর্তন</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">আপনার অ্যাকাউন্ট সুরক্ষিত রাখুন</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700" />
            </button>
          </div>
        </section>

        {/* Interface Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest px-2">ডিজাইন ও ইন্টারফেস</h2>
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800 shadow-sm">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-gray-200">ডার্ক মোড</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">অন্ধকারে ব্যবহারের জন্য</p>
                </div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors duration-300",
                  isDarkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                  isDarkMode ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase font-black text-blue-400 tracking-widest px-2">এপপ ডাওনলোড</h2>
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                   <p className="font-black text-lg leading-tight">এপপ হিসেবে চালান</p>
                   <p className="text-xs text-blue-100">আপনার হোম স্ক্রিনে যোগ করুন</p>
                </div>
             </div>
             <div className="space-y-3 bg-white/10 p-4 rounded-2xl text-[11px] leading-relaxed backdrop-blur-sm">
                <p>১. আপনার ব্রাউজারের থ্রি-ডট মেনুতে ক্লিক করুন।</p>
                <p>২. "Add to Home Screen" বা "Install App" সিলেক্ট করুন।</p>
                <p>৩. এরপর আপনার মোবাইল স্ক্রিনে Chetme এপপ আইকন চলে আসবে।</p>
             </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4">
          <h2 className="text-[10px] uppercase font-black text-red-400 dark:text-red-500 tracking-widest px-2">ডেঞ্জার জোন</h2>
          <button 
            onClick={handleDeleteAccount}
            className="w-full bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-900/30 p-5 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
              <UserX className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-red-600 dark:text-red-400">অ্যাকাউন্ট ডিলিট করুন</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">এটি অপরিবর্তনীয়</p>
            </div>
          </button>
        </section>
      </div>

      <div className="p-10 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Chetme v1.0.0</p>
      </div>
    </div>
  );
}
