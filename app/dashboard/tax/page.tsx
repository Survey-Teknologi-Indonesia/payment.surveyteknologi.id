"use client"

import React, { useState, useEffect } from 'react';
import { UploadCloud, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

interface InvoiceItem {
  id: string;
  client: string;
  date: string;
  dpp: number;
  ppn: number;
  pph23: number;
  status: 'Paid' | 'Pending';
}

export default function TaxDashboard() {
  const [reportingPeriod, setReportingPeriod] = useState("Juli 2026");
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, invoiceId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(invoiceId);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${invoiceId}_${Date.now()}.${fileExt}`;
      // Simpan di bucket "sti" folder "tax/pph23"
      const filePath = `tax/pph23/${fileName}`;

      const { data, error } = await supabase.storage
        .from('sti')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;
      
      alert(`Dokumen Bukti Potong PPh 23 untuk invoice ${invoiceId} berhasil diupload!`);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Gagal mengupload file: " + error.message);
    } finally {
      setUploadingId(null);
      e.target.value = ''; // Reset input
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { getInvoices } = await import('@/app/lib/actions/invoiceActions');
      const resInv = await getInvoices();
      if (resInv.success && resInv.data) {
        const formatted = resInv.data.map((row: any) => {
          let dateStr = row.date;
          if (row.date && typeof row.date !== 'string') {
             const d = new Date(row.date);
             dateStr = d.toLocaleDateString('en-GB'); 
          }
          const dppValue = Number(row.dpp);
          return {
            id: row.invoice_id,
            client: row.customer,
            date: dateStr,
            dpp: dppValue,
            ppn: Math.round(dppValue * 0.12),
            pph23: Math.round(dppValue * 0.02),
            status: row.status,
          };
        });
        setInvoices(formatted);
      }
    } catch (error) {
      console.error("Failed to load tax data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reportingPeriod]);

  // Calculations
  const totalDPP = invoices.reduce((acc, item) => acc + item.dpp, 0);
  const totalPPNKeluaran = invoices.reduce((acc, item) => acc + item.ppn, 0);
  const totalPPh23 = invoices.reduce((acc, item) => acc + item.pph23, 0);

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">PT SURVEY TEKNOLOGI INDONESIA</span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Rekapitulasi Pajak & Ready SPT</h1>
            <p className="text-sm text-slate-500 mt-1">
              Periode Laporan Masa Pajak: <span className="font-semibold text-slate-700">{reportingPeriod}</span>
              <br />
              <span className="text-[11px] text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-100 inline-block mt-2">
                * Tabel menampilkan data berdasarkan Tanggal Penerbitan Faktur Pajak (Invoice), bukan tanggal pelunasan.
              </span>
            </p>
          </div>
          <div>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              Cetak / Ekspor Ringkasan SPT
            </button>
          </div>
        </div>

        {/* 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">TOTAL PEREDARAN BRUTO (DPP)</h2>
            <p className="text-3xl font-bold text-slate-900 mb-1">{formatIDR(totalDPP)}</p>
            <p className="text-[11px] text-slate-400">Dasar Pengenaan Pajak Bulanan</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2">TOTAL PPN KELUARAN (12%)</h2>
            <p className="text-3xl font-bold text-indigo-900 mb-1">{formatIDR(totalPPNKeluaran)}</p>
            <p className="text-[11px] text-indigo-500">Siap input ke SPT Masa PPN</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <h2 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">TOTAL PPH 23 DIPOTONG KLIEN</h2>
            <p className="text-3xl font-bold text-slate-900 mb-1">{formatIDR(totalPPh23)}</p>
            <p className="text-[11px] text-emerald-600">Kredit pajak / Bukti potong</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Daftar Transaksi Objek Pajak Periode Ini</h2>
            <span className="text-xs text-slate-400">Sinkron otomatis dari modul Invoice</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">NO. INVOICE</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">KLIEN / CUSTOMER</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">TANGGAL</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">NILAI DPP (RP)</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">PPN 12% (RP)</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider">PPH 23 (2%)</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center">STATUS BAYAR</th>
                  <th className="py-3 px-6 font-semibold uppercase tracking-wider text-center">BUKTI POTONG PPh 23</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 text-slate-700">{inv.id}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{inv.client}</td>
                    <td className="py-4 px-6 text-slate-500">{inv.date}</td>
                    <td className="py-4 px-6 text-slate-900 font-medium">{formatIDR(inv.dpp)}</td>
                    <td className="py-4 px-6 text-indigo-600 font-medium">{formatIDR(inv.ppn)}</td>
                    <td className="py-4 px-6 text-emerald-600 font-medium">{formatIDR(inv.pph23)}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-medium border ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="file"
                        id={`upload-${inv.id}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleUpload(e, inv.id)}
                      />
                      <button 
                        onClick={() => document.getElementById(`upload-${inv.id}`)?.click()}
                        disabled={uploadingId === inv.id}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 transition-colors shadow-sm group cursor-pointer disabled:opacity-50"
                        title="Upload Bukti Potong PPh 23"
                      >
                        {uploadingId === inv.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={8} className="py-6 text-center text-slate-400">Belum ada transaksi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div className="bg-[#121826] p-6 rounded-2xl shadow-sm text-slate-300">
           <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> Panduan Cepat Pengisian DJP Online:
           </h3>
           <div className="space-y-1 text-xs">
             <p>1. Gunakan angka pada kotak <span className="text-indigo-400 font-semibold">Total PPN Keluaran</span> untuk diinput ke formulir e-Faktur / SPT Masa PPN bulanan.</p>
             <p>2. Simpan Bukti Potong PPh Pasal 23 dari masing-masing klien untuk dicatatkan sebagai kredit pajak pada SPT Tahunan Badan PT STI.</p>
           </div>
        </div>

      </div>
    </div>
  );
}
