import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { BadgeIcons, BadgeType } from "../types";
import { LogOut, Settings, Shield, Camera, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Profile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");

  const handleUpdateProfile = async () => {
    if (!profile) return;
    await updateDoc(doc(db, "users", profile.id), { bio });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  if (!profile) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-full pb-20">
      {/* Top Banner */}
      <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
        <button 
          onClick={() => navigate("/settings")}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 -mt-16 relative">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl shadow-gray-200 dark:shadow-none border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 bg-white dark:bg-gray-800 p-1 rounded-full shadow-lg -mt-20">
                <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-4xl font-black overflow-hidden border-4 border-white dark:border-gray-800 shadow-inner">
                  {profile.photoURL ? <img src={profile.photoURL} alt="" /> : profile.displayName[0]}
                </div>
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full border-4 border-white dark:border-gray-800 shadow-lg active:scale-90 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{profile.displayName}</h1>
              <span className="text-2xl" title={profile.badge}>{BadgeIcons[profile.badge]}</span>
            </div>
            
            <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50">
              <span className="text-blue-600 dark:text-blue-400 font-mono font-bold tracking-widest text-sm">UID: {profile.uid}</span>
            </div>

            <div className="mt-6 w-full text-left">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase tracking-wider font-black text-gray-400 dark:text-gray-500">বায়ো</label>
                <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 dark:text-blue-400">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 outline-none focus:border-blue-500 min-h-[100px] text-sm dark:text-white"
                    placeholder="আপনার সম্পর্কে কিছু লিখুন..."
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold"
                    >
                      সেভ করুন
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <p className={cn("text-sm text-gray-600 dark:text-gray-400 leading-relaxed", !profile.bio && "italic opacity-50")}>
                  {profile.bio || "এখনও কোনো বায়ো যুক্ত করা হয়নি।"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats / Info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 mb-1">কানেকশন</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">১২৪</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 mb-1">জয়েন করেছেন</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">২০২৪</span>
          </div>
        </div>

        {/* Action List */}
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
          {(profile.badge === BadgeType.ADMIN || profile.badge === BadgeType.EMPLOYEE) && (
            <button 
              onClick={() => navigate("/admin")}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm dark:text-gray-200">অ্যাডমিন প্যানেল</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">মডারেশন এবং ইউজার কন্ট্রোল</p>
                </div>
              </div>
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-red-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <p className="font-black text-sm">লগ-আউট করুন</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
