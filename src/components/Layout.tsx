import { Outlet, NavLink } from "react-router-dom";
import { MessageSquare, CircleDashed, Phone, User as UserIcon, Search } from "lucide-react";
import { cn } from "../lib/utils";
import WhatsAppButton from "./WhatsAppButton";
import NoticePopup from "./NoticePopup";

const navItems = [
  { icon: MessageSquare, label: "চ্যাট", path: "/chats" },
  { icon: CircleDashed, label: "স্টোরি", path: "/stories" },
  { icon: Search, label: "সার্চ", path: "/search" },
  { icon: Phone, label: "কল", path: "/calls" },
  { icon: UserIcon, label: "প্রোফাইল", path: "/profile" },
];

export default function Layout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      <NoticePopup />
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <WhatsAppButton />

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-4 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-400"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
