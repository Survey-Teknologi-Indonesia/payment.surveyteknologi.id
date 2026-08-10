"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LogOut,
  Sun,
  Moon,
  Menu,
  Bell,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { checkHasUnreadMessages } from "@/app/lib/actions/chatActions";

interface DashboardNavbarProps {
  onOpenSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function DashboardNavbar({
  onOpenSidebar,
  searchQuery = "",
  onSearchChange,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Detect current theme on mount
    const savedTheme = localStorage.getItem("theme");
    const isLight = savedTheme === "light" || document.documentElement.classList.contains("light");
    if (isLight) {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  useEffect(() => {
    async function initUnread() {
      const res = await checkHasUnreadMessages();
      if (res.success) {
        setHasUnread(res.data || false);
      }
    }
    initUnread();

    const handleNewMsg = () => setHasUnread(true);
    const handleChatRead = () => initUnread();

    window.addEventListener("new_chat_message", handleNewMsg);
    window.addEventListener("chat_read", handleChatRead);

    return () => {
      window.removeEventListener("new_chat_message", handleNewMsg);
      window.removeEventListener("chat_read", handleChatRead);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      if (newTheme === "light") {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      }
      return newTheme;
    });
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      router.push("/login");
    }, 600);
  };

  const toChat = () => {
    router.push("/dashboard/chat");
  }

  return (
    <header className="sticky top-0 z-40 w-full h-20 border-b border-white/10 light:border-slate-200 bg-[#090d16]/85 light:bg-slate-50/85 backdrop-blur-md transition-all duration-300 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      
      {/* Left Section: Mobile Menu Trigger & Portal Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl bg-white/5 light:bg-slate-200/80 hover:bg-white/10 light:hover:bg-slate-300 text-gray-300 light:text-slate-700 md:hidden transition-colors cursor-pointer"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 light:bg-white border border-white/10 light:border-slate-200/80 text-xs font-semibold text-gray-300 light:text-slate-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
          <span>STI Portal v2.4</span>
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className="flex-1 max-w-md mx-auto relative">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 light:text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Cari No. Invoice, WBS Proyek, atau Nama Client..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-300/80 text-sm text-white light:text-slate-900 placeholder-gray-400 light:placeholder-slate-400 focus:outline-none focus:border-brand-cyan light:focus:border-brand-blue focus:ring-1 focus:ring-brand-cyan/50 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right Section: Theme Toggle, Notifications, and Logout Button */}
      <div className="flex items-center gap-3">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-white/10 light:border-slate-200/80 bg-white/5 light:bg-white text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={toChat}
          className="relative p-2.5 rounded-xl border border-white/10 light:border-slate-200/80 bg-white/5 light:bg-white text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors shadow-sm hidden sm:flex items-center justify-center cursor-pointer"
          title="Notifications"
        >
          <MessageCircle className="w-4 h-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          )}
        </button>

        {/* Tombol Logout Paling Kanan */}
        {/* <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 light:from-red-500/10 light:to-red-600/10 light:hover:from-red-500/20 light:hover:to-red-600/20 text-red-400 light:text-red-600 border border-red-500/30 hover:border-red-500/50 text-sm font-bold shadow-lg shadow-red-500/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          <LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{isLoggingOut ? "Keluar..." : "Logout"}</span>
        </button> */}

      </div>

    </header>
  );
}
