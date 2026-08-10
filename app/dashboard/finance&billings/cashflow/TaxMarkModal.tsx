"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Loader2, Info } from "lucide-react";
import { addTaxObject } from "@/app/lib/actions/taxActions";

interface TaxMarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any | null;
  onSuccess: () => void;
}

export default function TaxMarkModal({ isOpen, onClose, transaction, onSuccess }: TaxMarkModalProps) {
  const [taxName, setTaxName] = useState("PPN 12%");
  const [customTaxName, setCustomTaxName] = useState("");
  const [taxType, setTaxType] = useState("Keluaran");
  const [baseAmount, setBaseAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [status, setStatus] = useState("Paid");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Prepopulate when transaction changes
  useEffect(() => {
    if (transaction) {
      setBaseAmount(transaction.amount || 0);
      
      // Auto calculate PPN 12% as default tax amount
      setTaxAmount(Math.round((transaction.amount || 0) * 0.12));
    }
  }, [transaction]);

  // Recalculate tax amount based on selected tax name
  useEffect(() => {
    if (!transaction) return;
    
    if (taxName === "PPN 12%") {
      setTaxAmount(Math.round(baseAmount * 0.12));
    } else if (taxName === "PPh 23") {
      setTaxAmount(Math.round(baseAmount * 0.02));
    } else if (taxName === "PPh 21") {
      setTaxAmount(Math.round(baseAmount * 0.05)); // Just an example default
    } else if (taxName === "PPh 4(2)") {
      setTaxAmount(Math.round(baseAmount * 0.10)); // Example default
    }
  }, [taxName, baseAmount, transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const finalTaxName = taxName === "Custom" ? customTaxName : taxName;
    if (!finalTaxName) {
      setErrorMsg("Nama pajak wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await addTaxObject(
        transaction.id,
        transaction.description,
        finalTaxName,
        taxType,
        baseAmount,
        taxAmount,
        status,
        transaction.date.toISOString().split('T')[0]
      );

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Gagal menyimpan objek pajak.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Tandai sebagai Objek Pajak</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-3 text-sm text-indigo-800">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{transaction.description}</p>
              <p className="text-indigo-600/80">Tanggal: {transaction.dateString} | Nominal: Rp{transaction.amount.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Jenis Pajak</label>
              <select
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
              >
                <option value="PPN 12%">PPN 12%</option>
                <option value="PPh 23">PPh 23</option>
                <option value="PPh 21">PPh 21</option>
                <option value="PPh 4(2)">PPh 4(2)</option>
                <option value="Custom">Lainnya...</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Tipe Pajak</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
              >
                <option value="Keluaran">Keluaran</option>
                <option value="Masukan">Masukan</option>
                <option value="Potongan">Potongan</option>
              </select>
            </div>
          </div>

          {taxName === "Custom" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-semibold text-slate-700">Nama Pajak Khusus</label>
              <input
                type="text"
                value={customTaxName}
                onChange={(e) => setCustomTaxName(e.target.value)}
                placeholder="Contoh: PPh 22, Pajak Daerah..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nilai DPP (Rp)</label>
              <input
                type="number"
                value={baseAmount || ''}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nominal Pajak (Rp)</label>
              <input
                type="number"
                value={taxAmount || ''}
                onChange={(e) => setTaxAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan font-semibold text-indigo-700"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Status Pembayaran / Lapor</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
            >
              <option value="Paid">Sudah Dibayar (Paid)</option>
              <option value="Unpaid">Belum Dibayar (Unpaid)</option>
              <option value="Reported">Sudah Dilaporkan (Reported)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Simpan & Tandai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
