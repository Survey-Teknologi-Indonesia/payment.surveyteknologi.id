"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "../../login/actions";
import {
  LayoutDashboard,
  FileText,
  Compass,
  Layers,
  Activity,
  Settings,
  LifeBuoy,
  User,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Clock,
  Calculator,
  ClipboardPen,
  ArrowLeft,
  Home,
  Wallet,
  LogOut,
  CalendarClock,
  ListChecks,
  LetterText,
  CalculatorIcon,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: { name: string; href: string; icon?: React.ElementType }[];
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: "Memuat...",
    role: "User",
    initials: "--",
  });

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const level = localStorage.getItem("userLevel");
    const name = localStorage.getItem("userName");
    const jabatan = localStorage.getItem("userJabatan");

    if (email) {
      const namePart = email.replace("@surveyteknologi.id", "");
      const formattedName = namePart
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const displayName = name || formattedName;
      const initials = displayName.substring(0, 2).toUpperCase();

      setUserInfo({
        name: displayName,
        role: jabatan || level || "User",
        initials: initials,
      });
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userLevel");
    localStorage.removeItem("userName");
    localStorage.removeItem("userJabatan");
    router.push("/login");
  };

  // Track open state for submenus
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    "Tax Calculator": pathname?.startsWith("/dashboard/tax") || false,
  });

  const toggleSubmenu = (menuName: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const isProjectWorkspace =
    pathname?.startsWith("/dashboard/projects/") &&
    pathname !== "/dashboard/projects";
  const projectId = isProjectWorkspace ? pathname.split("/")[3] : null;

  const projectMenuItems: MenuItem[] = [
    {
      name: "Overview",
      href: `/dashboard/projects/${projectId}`,
      icon: Home,
    },
    {
      name: "Tagihan (Invoice)",
      href: `/dashboard/projects/${projectId}/invoice`,
      icon: FileText,
    },
    {
      name: "Kwitansi",
      href: `/dashboard/projects/${projectId}/kwitansi`,
      icon: FileText,
    },
    {
      name: "Operational",
      href: `/dashboard/projects/${projectId}/operational`,
      icon: Wallet,
      subItems: [
        {
          name: "Overview",
          href: `/dashboard/projects/${projectId}/operational/overview`,
          icon: LayoutDashboard,
        },
        {
          name: "Operational Report",
          href: `/dashboard/projects/${projectId}/operational/report`,
          icon: FileText,
        },
      ],
    },
    {
      name: "Documents",
      href: `/dashboard/projects/${projectId}/documents`,
      icon: FileText,
    },
  ];

  // Menu Utama
  const mainMenuItems: MenuItem[] = [
    {
      name: "Projects Hub",
      href: "/dashboard/projects",
      icon: Layers,
    },
    {
      name: "Invoice Tracker",
      href: "/dashboard/invoiceTracker",
      icon: Activity,
    },
    {
      name: "Document",
      href: "/dashboard/documentGenerator",
      icon: Activity,
      subItems: [
        {
          name: "Invoice Generator",
          href: "/dashboard/documentGenerator/invoiceGenerator",
          icon: FileText
        },
        {
          name: "Proposal Generator",
          href: "/dashboard/documentGenerator/proposal",
          icon: LetterText
        },
      ],
    },
    {
      name: "Tax Calculator",
      href: "/dashboard/tax",
      icon: Calculator,
      subItems: [
        { name: "Tax Overview", href: "/dashboard/tax", icon: LayoutDashboard },
        { name: "PPN Masukan", href: "/dashboard/tax/ppn-masukan", icon: CalculatorIcon },
        { name: "PPh 21", href: "/dashboard/tax/pph21", icon: CalculatorIcon },
      ],
    },
    {
      name: "Scheduler",
      href: "/dashboard/scheduler",
      icon: CalendarClock,
    },
    {
      name: "Assets",
      href: "/dashboard/assets",
      icon: ListChecks,
    },
  ];

  const footerMenuItems = [
    { name: "Settings", href: "/dashboard#settings", icon: Settings },
    { name: "Help & Support", href: "/dashboard/help", icon: LifeBuoy },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 flex flex-col justify-between h-screen w-64 bg-[#121826]/95 light:bg-white border-r border-white/10 light:border-slate-200 shadow-2xl md:shadow-none backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Section: Logo & Company Name (Row Layout) + Menu Utama */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo & Company Name (Row Layout) */}
          <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10 light:border-slate-200 flex-shrink-0 group">
            <Link href="/dashboard" className="flex items-center gap-3 w-full">
              <div className="relative overflow-hidden rounded-xl border border-white/15 light:border-slate-200 p-1 bg-white/5 light:bg-slate-50 transition-all duration-300 group-hover:border-brand-cyan/50 group-hover:shadow-md group-hover:shadow-brand-cyan/20 flex-shrink-0">
                <Image
                  src="/assets/image/logo.jpeg"
                  width={38}
                  height={38}
                  alt="Survey Teknologi Indonesia Logo"
                  className="rounded-lg object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold tracking-wider text-white light:text-slate-900 uppercase leading-tight truncate">
                  SURVEY TEKNOLOGI
                </span>
                <span className="text-[10px] font-bold text-brand-cyan tracking-widest uppercase leading-tight mt-0.5 flex items-center gap-1">
                  <span>INDONESIA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                </span>
              </div>
            </Link>
          </div>

          {/* Menu Utama Label */}
          <div className="px-6 pt-6 pb-2">
            <span className="text-[10px] font-bold text-gray-400 light:text-slate-400 uppercase tracking-widest">
              {isProjectWorkspace ? "Project Menu" : "Menu Utama"}
            </span>
          </div>

          {/* Menu Navigation */}
          <nav className="px-3 space-y-1">
            {isProjectWorkspace && <div className="mb-2 px-1"></div>}

            {(isProjectWorkspace ? projectMenuItems : mainMenuItems).map(
              (item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;

                // Determine if the main item is active
                let isActive = false;
                if (hasSubItems) {
                  // For parent items, consider active if pathname starts with href (exact match not required)
                  isActive =
                    pathname === item.href ||
                    (pathname?.startsWith(item.href + "/") && true);
                } else {
                  isActive = pathname === item.href;
                }

                const isSubMenuOpen = openMenus[item.name];

                return (
                  <div key={item.name} className="flex flex-col">
                    {hasSubItems ? (
                      // Button for dropdown toggle
                      <button
                        onClick={(e) => toggleSubmenu(item.name, e)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative w-full ${
                          isActive
                            ? "bg-gradient-to-r from-brand-cyan/20 to-[#004b87]/30 light:from-brand-blue/10 light:to-brand-cyan/10 text-white light:text-[#004b87] border border-brand-cyan/30 light:border-brand-blue/30 shadow-lg shadow-brand-cyan/10"
                            : "text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? "bg-brand-cyan/20 light:bg-brand-blue text-brand-cyan light:text-white"
                                : "text-gray-400 light:text-slate-500 group-hover:text-white light:group-hover:text-slate-900"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center">
                          {isSubMenuOpen ? (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isActive ? "text-brand-cyan" : "text-gray-500 group-hover:text-white"}`}
                            />
                          ) : (
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${isActive ? "text-brand-cyan" : "text-gray-500 group-hover:text-white"}`}
                            />
                          )}
                        </div>
                      </button>
                    ) : (
                      // Regular Link
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                          isActive
                            ? "bg-gradient-to-r from-brand-cyan/20 to-[#004b87]/30 light:from-brand-blue/10 light:to-brand-cyan/10 text-white light:text-[#004b87] border border-brand-cyan/30 light:border-brand-blue/30 shadow-lg shadow-brand-cyan/10"
                            : "text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? "bg-brand-cyan/20 light:bg-brand-blue text-brand-cyan light:text-white"
                                : "text-gray-400 light:text-slate-500 group-hover:text-white light:group-hover:text-slate-900"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{item.name}</span>
                        </div>
                        {isActive ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan light:bg-[#004b87]" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                        )}
                      </Link>
                    )}

                    {/* Submenu Dropdown Items */}
                    {hasSubItems && isSubMenuOpen && (
                      <div className="mt-1 space-y-1 pl-11 pr-2 pb-2">
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={onClose}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                                isSubActive
                                  ? "text-brand-cyan bg-brand-cyan/10"
                                  : "text-gray-400 hover:text-white hover:bg-slate-600"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {SubIcon && <SubIcon className="w-3.5 h-3.5" />}
                                <span>{sub.name}</span>
                              </div>
                              {isSubActive && (
                                <div className="w-1 h-1 rounded-full bg-brand-cyan" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </nav>
        </div>

        {/* Bottom Section: Footer Navbar (Settings dll & Admin Profile) */}
        <div className="p-4 border-t border-white/10 light:border-slate-200 space-y-4 bg-black/20 light:bg-slate-50/80">
          {/* Footer Navigation Label */}
          <div className="px-2">
            <span className="text-[10px] font-bold text-gray-400 light:text-slate-400 uppercase tracking-widest">
              System & Settings
            </span>
          </div>

          <div className="space-y-1">
            {footerMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200/60 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-brand-cyan transition-colors" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-300 transition-colors" />
              <span>Logout</span>
            </button>
          </div>

          {/* User Profile Summary Card */}
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="block group"
          >
            <div className="p-3 rounded-xl bg-white/5 light:bg-white border border-white/10 light:border-slate-200/80 shadow-sm flex items-center gap-3 transition-colors group-hover:bg-white/10 light:group-hover:bg-slate-50 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#004b87] to-brand-cyan flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                {userInfo.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white light:text-slate-900 truncate group-hover:text-brand-cyan transition-colors">
                  {userInfo.name}
                </p>
                <p className="text-[10px] text-brand-cyan font-medium truncate capitalize">
                  {userInfo.role}
                </p>
              </div>
              <div
                className="h-2 w-2 rounded-full bg-emerald-400"
                title="Online"
              />
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
