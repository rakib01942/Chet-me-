import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Story, BadgeType } from "../types";
import { Plus, Image as ImageIcon, X } from "lucide-react";
import { addHours } from "date-fns";

export default function Stories() {
  const { profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [storyType, setStoryType] = useState<"text" | "image" | "video">("text");
  const [storyText, setStoryText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    if (!profile) return;

    const storiesRef = collection(db, "stories");
    const q = query(
      storiesRef,
      where("expiresAt", ">", new Date()),
      orderBy("expiresAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storyList: Story[] = [];
      snapshot.forEach((doc) => {
        storyList.push({ id: doc.id, ...doc.data() } as Story);
      });
      setStories(storyList);
    });

    return () => unsubscribe();
  }, [profile]);

  const uploadStory = async () => {
    if (storyType === "text" && !storyText.trim()) return;
    if (storyType !== "text" && !mediaUrl.trim()) return;
    if (!profile) return;

    const duration = profile.badge === BadgeType.VIP ? 48 : 24;
    const expiresAt = addHours(new Date(), duration);

    try {
      await addDoc(collection(db, "stories"), {
        userId: profile.uid,
        userAuthId: profile.id,
        content: storyText,
        mediaUrl: storyType !== "text" ? mediaUrl : null,
        type: storyType,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt
      });
      setStoryText("");
      setMediaUrl("");
      setStoryType("text");
      setIsUploading(false);
    } catch (err) {
      console.error("Error uploading story:", err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-black text-blue-600">স্টোরি</h1>
        <button 
          onClick={() => setIsUploading(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          নতুন স্টোরি
        </button>
      </header>

      {/* Uploading UI Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl">স্টোরি তৈরি করুন</h2>
              <button 
                onClick={() => {
                  setIsUploading(false);
                  setStoryType("text");
                  setMediaUrl("");
                  setStoryText("");
                }}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {["text", "image", "video"].map((type) => (
                <button
                  key={type}
                  onClick={() => setStoryType(type as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                    storyType === type ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"
                  }`}
                >
                  {type === "text" ? "লিখন" : type === "image" ? "ছবি" : "ভিডিও"}
                </button>
              ))}
            </div>
            
            {storyType !== "text" && (
              <div className="mb-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">মিডিয়া ইউআরএল</label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={`https://example.com/${storyType}.jpg`}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            )}

            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder={storyType === "text" ? "আপনার মনে আজ কী আছে?" : "কিছু ক্যাপশন লিখুন (ঐচ্ছিক)"}
              className="w-full min-h-[120px] p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-base leading-relaxed mb-6"
            />

            <button 
              onClick={uploadStory}
              disabled={(storyType === "text" && !storyText.trim()) || (storyType !== "text" && !mediaUrl.trim())}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 disabled:bg-gray-300 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              পোস্ট করুন
            </button>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Current User Add Story Tile */}
        <div 
          onClick={() => setIsUploading(true)}
          className="relative h-64 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-inner border border-blue-50">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-500 font-sans tracking-tight">আপনার স্টোরি</span>
        </div>

        {stories.map((story) => (
          <div 
            key={story.id} 
            className="relative h-64 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group active:scale-95 transition-all"
          >
            {/* User Overlay */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center text-[10px] font-black text-blue-600">
                {story.userId[0]}
              </div>
              <span className="text-[10px] font-black text-white drop-shadow-md bg-black/30 px-2 py-1 rounded-full backdrop-blur-[2px]">
                {story.userId}
              </span>
            </div>
            
            <div className="flex-1 bg-black overflow-hidden relative group">
              {story.type === "text" ? (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex items-center justify-center text-center">
                  <p className="text-white font-bold leading-snug drop-shadow-sm select-none">
                    {story.content}
                  </p>
                </div>
              ) : story.type === "image" ? (
                <img 
                  src={story.mediaUrl} 
                  alt="Story content" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as any).src = "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400";
                  }}
                />
              ) : (
                <video 
                  src={story.mediaUrl} 
                  className="w-full h-full object-cover" 
                  muted 
                  autoPlay 
                  loop 
                  playsInline 
                />
              )}

              {/* Caption for Media */}
              {story.type !== "text" && story.content && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-[11px] font-medium line-clamp-2">{story.content}</p>
                </div>
              )}
            </div>

            <div className="p-2 bg-white flex items-center justify-center border-t border-gray-50 h-3">
               <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                 <div className="bg-blue-500 h-full w-full animate-progress origin-left"></div>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}
