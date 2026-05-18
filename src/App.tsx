/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chats from "./pages/Chats";
import Stories from "./pages/Stories";
import Calls from "./pages/Calls";
import Profile from "./pages/Profile";
import ChatDetail from "./pages/ChatDetail";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import BanScreen from "./pages/BanScreen";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-black text-sm uppercase tracking-widest">Chetme Loading...</p>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (profile?.isPermanentlyBanned) return <BanScreen type="permanent" />;
  if (profile?.bannedUntil && profile.bannedUntil.toDate() > new Date()) return <BanScreen type="temporary" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/chats" />} />
            <Route path="chats" element={<Chats />} />
            <Route path="stories" element={<Stories />} />
            <Route path="calls" element={<Calls />} />
            <Route path="profile" element={<Profile />} />
            <Route path="search" element={<Search />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <ChatDetail />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

