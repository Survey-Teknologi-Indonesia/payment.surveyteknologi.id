"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { submitRequestAccess } from "@/app/lib/actions/ticketActions";

export default function RequestAccessPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await submitRequestAccess(formData);

    if (res.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(res.error || "Terjadi kesalahan saat memproses permintaan.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg light:bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Tombol Kembali */}
      <div className="absolute top-8 left-8">
        <Link 
          href="/login"
          className="flex items-center gap-2 text-sm text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-brand-cyan/10 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-brand-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-white light:text-slate-900">Request Access</h1>
          <p className="text-slate-400 light:text-slate-500 mt-2">
            Isi formulir ini untuk meminta akses ke sistem. Tim IT kami akan meninjau permintaan Anda.
          </p>
        </div>

        <div className="bg-dark-card light:bg-white border border-slate-800/80 light:border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Ornamen Desain */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-bl-[100px] pointer-events-none" />

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h2 className="text-xl font-bold text-white light:text-slate-900 mb-2">Permintaan Terkirim!</h2>
              <p className="text-sm text-slate-400 light:text-slate-500 mb-6">
                Tiket pengajuan akses Anda berhasil dibuat. Silakan tunggu informasi lebih lanjut melalui email.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-sm font-semibold text-brand-cyan hover:underline"
              >
                Buat permintaan baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-slate-300 light:text-slate-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full px-4 py-3 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-slate-300 light:text-slate-700">Alamat Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reason" className="text-sm font-semibold text-slate-300 light:text-slate-700">Alasan Permintaan</label>
                <textarea 
                  id="reason" 
                  name="reason" 
                  required 
                  rows={4}
                  placeholder="Jelaskan secara singkat mengapa Anda membutuhkan akses ke sistem ini..."
                  className="w-full px-4 py-3 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 bg-brand-cyan hover:bg-brand-cyan/90 text-[#090d16] font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Kirim Permintaan
                    <Send className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
