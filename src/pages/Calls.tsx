import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { CallRecord } from "../types";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

export default function Calls() {
  const { profile } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);

  useEffect(() => {
    if (!profile) return;

    const callsRef = collection(db, "calls");
    const q = query(
      callsRef,
      where("from", "==", profile.uid),
      orderBy("startedAt", "desc")
    );
    // Note: To get incoming calls too, we'd need multiple queries or a combined field
    // For this demo, let's keep it simple

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const callList: CallRecord[] = [];
      snapshot.forEach((doc) => {
        callList.push({ id: doc.id, ...doc.data() } as CallRecord);
      });
      setCalls(callList);
    });

    return () => unsubscribe();
  }, [profile]);

  return (
    <div className="bg-white min-h-full">
      <header className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h1 className="text-2xl font-black text-blue-600">কল</h1>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <Phone className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      <div className="divide-y divide-gray-50">
        {calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-10 h-10 opacity-20" />
            </div>
            <p className="font-bold">কোনো কল রেকর্ড নেই</p>
          </div>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  call.status === 'missed' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                }`}>
                  {call.status === 'accepted' ? <PhoneOutgoing className="w-5 h-5" /> : <PhoneMissed className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">ইউজার: {call.to}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-medium lowercase">ভয়েস কল</span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDistanceToNow(call.startedAt.toDate(), { addSuffix: true, locale: bn })}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-colors active:scale-90">
                <Phone className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for Contacting Dial pad? */}
      <div className="fixed bottom-24 right-6">
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-200 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all">
          <Video className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
