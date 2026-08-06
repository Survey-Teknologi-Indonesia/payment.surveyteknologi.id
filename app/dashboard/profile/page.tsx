"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, Lock, Save, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { getUserProfile, updateUserProfile } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  
  // Show/Hide password states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    emailPrefix: "",
    jabatan: "",
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const res = await getUserProfile();
      if (res.success && res.user) {
        const fullEmail = res.user.email || "";
        const emailPrefix = fullEmail.replace('@surveyteknologi.id', '');
        
        setForm({
          name: res.user.name || "",
          emailPrefix: emailPrefix,
          jabatan: res.user.jabatan || "",
          oldPassword: "",
          newPassword: "",
        });
      } else {
        setStatus({ type: "error", message: res.message || "Failed to load profile." });
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: null, message: "" });

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("emailPrefix", form.emailPrefix);
    formData.append("oldPassword", form.oldPassword);
    formData.append("newPassword", form.newPassword);

    const res = await updateUserProfile(formData);
    
    if (res.success && res.user) {
      setStatus({ type: "success", message: res.message });
      // Update localStorage so sidebar is updated
      if (res.user.name) localStorage.setItem("userName", res.user.name);
      localStorage.setItem("userEmail", res.user.email);
      
      // Reset password fields
      setForm(prev => ({ ...prev, oldPassword: "", newPassword: "" }));

      // Dispatch storage event manually
      window.dispatchEvent(new Event('storage'));
    } else {
      setStatus({ type: "error", message: res.message });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 text-slate-100 light:text-slate-900">
      {/* Top Navigation */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <header className="mb-8">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-4xl text-white light:text-slate-900 flex items-center gap-3">
            <User className="w-10 h-10 text-brand-cyan" />
            My Profile
          </p>
          <p className="font-medium text-slate-400 light:text-slate-500 text-lg">
            Manage your personal information and account settings.
          </p>
        </div>
      </header>

      <section className="bg-white/5 light:bg-white border border-white/10 light:border-slate-200 shadow-xl rounded-2xl p-6 lg:p-8 backdrop-blur-xl">
        {status.message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 ${
              status.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 light:text-emerald-600"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400 light:text-rose-600"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white light:text-slate-900 border-b border-white/10 light:border-slate-200 pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 light:text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-cyan" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-black/20 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-xl px-4 py-3 text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                  required
                />
              </div>

              {/* Email Field with Fixed Domain */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 light:text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-cyan" /> Email Address
                </label>
                <div className="flex bg-black/20 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-xl overflow-hidden focus-within:border-brand-cyan/50 focus-within:ring-1 focus-within:ring-brand-cyan/50 transition-all">
                  <input
                    type="text"
                    name="emailPrefix"
                    value={form.emailPrefix}
                    onChange={handleChange}
                    placeholder="you"
                    className="w-full bg-transparent px-4 py-3 text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none"
                    required
                  />
                  <div className="flex items-center px-4 py-3 bg-white/5 light:bg-slate-200/50 border-l border-white/10 light:border-slate-200 text-slate-400 light:text-slate-500 font-medium select-none">
                    @surveyteknologi.id
                  </div>
                </div>
              </div>

              {/* Jabatan Field (Read Only) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-300 light:text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-cyan" /> Role / Jabatan (Read Only)
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={form.jabatan}
                  readOnly
                  className="w-full bg-black/40 light:bg-slate-100 border border-white/5 light:border-slate-200 rounded-xl px-4 py-3 text-slate-400 light:text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white light:text-slate-900 border-b border-white/10 light:border-slate-200 pb-2">Change Password</h3>
            <p className="text-sm text-slate-400">Leave these fields empty if you do not want to change your password.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 light:text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={form.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="w-full bg-black/20 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-xl pl-4 pr-12 py-3 text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 light:hover:text-slate-600 transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 light:text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-cyan" /> New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full bg-black/20 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-xl pl-4 pr-12 py-3 text-white light:text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 light:hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-brand-cyan hover:bg-brand-cyan/90 text-[#00284d] font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-brand-cyan/20 disabled:opacity-70 disabled:cursor-not-allowed text-white"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
