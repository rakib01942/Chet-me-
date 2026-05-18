import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit, orderBy, or, and } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { AdminNotice } from "../types";
import { X, Megaphone, ExternalLink } from "lucide-react";

export default function NoticePopup() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchNotices = async () => {
      const q = query(
        collection(db, "notices"),
        and(
          where("isActive", "==", true),
          or(
            where("type", "==", "global"),
            where("targetUids", "array-contains", profile.uid)
          )
        ),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminNotice));
      if (list.length > 0) {
        setNotices(list);
        setShow(true);
      }
    };
    fetchNotices();
  }, [profile]);

  if (!show || notices.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 p-6 text-white relative">
          <button 
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="w-6 h-6" />
            <h2 className="text-xl font-black tracking-tight">গুরুত্বপূর্ণ নোটিশ</h2>
          </div>
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Chetme Official Update</p>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {notices.map((notice) => (
            <div key={notice.id} className="space-y-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              {notice.imageUrl && (
                <img 
                  src={notice.imageUrl} 
                  alt={notice.title} 
                  className="w-full h-40 object-cover rounded-2xl bg-gray-100"
                />
              )}
              <div className="space-y-2">
                <h3 className="font-black text-gray-900 leading-tight text-base">{notice.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{notice.body}</p>
              </div>
              {notice.link && (
                <a 
                  href={notice.link} 
                  target="_blank" 
                  className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline py-2 px-4 bg-blue-50 rounded-xl w-fit"
                >
                  বিস্তারিত দেখুন <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={() => setShow(false)}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-colors"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
}
