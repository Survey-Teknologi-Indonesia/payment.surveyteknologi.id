"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../components/layout/sidebar";
import DashboardNavbar from "../components/layout/dashboard-navbar";
import { X } from "lucide-react";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"bulan-ini" | "q3" | "tahun-ini">(
    "bulan-ini",
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto hide toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Data statistik dashboard berhasil diperbarui!");
    }, 700);
  };

  const handleExportReport = () => {
    setToastMessage(
      "Laporan Tagihan & Pembayaran Q3_2026.pdf sedang diunduh...",
    );
  };

  const handleTaskingRequest = () => {
    setToastMessage(
      "Permintaan Tasking Satelit Resolusi 1.5m telah dijadwalkan ke Tim Operasional.",
    );
  };

  return (
    <div className="min-h-screen print:min-h-auto flex bg-[#090d16] light:bg-slate-50 text-slate-100 light:text-slate-900 font-sans transition-colors duration-300 relative overflow-x-clip print:overflow-visible">
      {/* 1. SIDEBAR KIRI */}
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* 2. AREA CONTENT UTAMA + NAVBAR ATAS */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 print:ml-0 print:overflow-visible">
        {/* Top Navbar dengan Search Bar dan Tombol Logout */}
        <div className="print:hidden">
          <DashboardNavbar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />
        </div>

        {/* Background Tech Grid & Glowing Orbs */}
        <div className="absolute inset-0 bg-tech-grid opacity-20 light:opacity-30 pointer-events-none" />
        <div className="absolute top-32 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,163,224,0.12)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none animate-pulse duration-10000" />
        <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,75,135,0.15)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#121826]/95 light:bg-white/95 border border-brand-cyan/40 shadow-2xl backdrop-blur-md text-white light:text-slate-900 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan">
              
            </div>
            <p className="text-sm font-medium">{toastMessage}</p>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-gray-400 hover:text-white light:hover:text-slate-900 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <main className="p-6 w-full">
            {children}
        </main>
      </div>
    </div>
  );
}
