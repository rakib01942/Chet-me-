import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate, Link } from "react-router-dom";
import { generateUID } from "../lib/utils";
import { BadgeType } from "../types";
import Logo from "../components/Logo";

export default function Register() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "পুরুষ", // Default to Male in Bengali
    isPublic: true
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: formData.displayName });

      const uid = generateUID();
      const initialProfile = {
        id: firebaseUser.uid,
        uid: uid,
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        photoURL: "",
        bio: "",
        gender: formData.gender,
        age: parseInt(formData.age),
        isPublic: formData.isPublic,
        badge: (formData.email === "mf460854@gmail.com" || formData.email === "mdfaruq0194@gmail.com") 
          ? BadgeType.ADMIN : BadgeType.NORMAL,
        uidPrivacy: true,
        bannedUntil: null,
        isPermanentlyBanned: false,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), initialProfile);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center flex flex-col items-center">
          <Logo className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">রেজিস্ট্রেশন করুন</h1>
          <p className="mt-2 text-gray-600 font-medium">Chetme এ আজই যোগ দিন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="আপনার নাম"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">বয়স</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="বয়স"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">লিঙ্গ</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="পুরুষ">পুরুষ</option>
                <option value="নারী">নারী</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+৮৮০১৭০০০০০০০০"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">পাবলিক অ্যাকাউন্ট হিসেবে সেট করুন</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-lg"
          >
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" className="text-blue-600 font-bold">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
}
