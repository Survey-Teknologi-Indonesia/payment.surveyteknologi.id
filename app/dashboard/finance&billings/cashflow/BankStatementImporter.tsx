"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, Trash2, CheckCircle2 } from "lucide-react";
import { saveBankStatement } from "@/app/lib/actions/bankActions";

interface ParsedTransaction {
  date: string;
  description: string;
  teller: string | null;
  debit: number;
  credit: number;
  balance: number | null;
  category: string;
}

export default function BankStatementImporter({ onImportSuccess }: { onImportSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setTransactions([]);
      
      // Auto trigger extraction
      await extractData(selectedFile);
    }
  };

  const extractData = async (selectedFile: File) => {
    setIsExtracting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/extract-statement", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract data");

      setTransactions(data.transactions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCategoryChange = (index: number, newCategory: string) => {
    const updated = [...transactions];
    updated[index].category = newCategory;
    setTransactions(updated);
  };

  const handleDeleteRow = (index: number) => {
    const updated = transactions.filter((_, i) => i !== index);
    setTransactions(updated);
  };

  const handleSave = async () => {
    if (!file || transactions.length === 0) return;
    setIsSaving(true);
    setError(null);

    const res = await saveBankStatement(file.name, transactions);
    setIsSaving(false);

    if (res.success) {
      setIsOpen(false);
      setFile(null);
      setTransactions([]);
      onImportSuccess();
    } else {
      setError(res.error || "Failed to save to database");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#004b87] text-white rounded-lg text-sm font-medium hover:bg-[#003865] transition-colors shadow-sm"
      >
        <Upload className="w-4 h-4" />
        Import Mutasi PDF
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Import Mutasi Bank (AI)</h3>
                <p className="text-sm text-slate-500">Unggah PDF rekening koran, AI akan mengekstrak otomatis.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              
              {!file && !isExtracting && (
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-[#004b87] hover:bg-blue-50/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="w-10 h-10 text-slate-400 mb-4" />
                  <p className="text-sm font-medium text-slate-900">Klik untuk mengunggah PDF</p>
                  <p className="text-xs text-slate-500 mt-1">Maksimal ukuran file 10MB</p>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {isExtracting && (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#004b87] animate-spin mb-4" />
                  <p className="text-sm font-medium text-slate-900">Membaca dokumen dengan AI...</p>
                  <p className="text-xs text-slate-500 mt-1">Harap tunggu beberapa saat.</p>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-lg text-sm mb-6 border border-rose-100">
                  {error}
                </div>
              )}

              {transactions.length > 0 && !isExtracting && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                          <th className="p-4">Tanggal</th>
                          <th className="p-4">Uraian Transaksi</th>
                          <th className="p-4">Teller</th>
                          <th className="p-4 text-right">Debet</th>
                          <th className="p-4 text-right">Kredit</th>
                          <th className="p-4 text-right">Saldo</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {transactions.map((trx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-4 whitespace-nowrap text-slate-600">{trx.date}</td>
                            <td className="p-4 text-slate-900">{trx.description}</td>
                            <td className="p-4 text-slate-600">{trx.teller || '-'}</td>
                            <td className="p-4 text-right font-medium text-rose-600">
                              {trx.debit > 0 ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(trx.debit) : '-'}
                            </td>
                            <td className="p-4 text-right font-medium text-emerald-600">
                              {trx.credit > 0 ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(trx.credit) : '-'}
                            </td>
                            <td className="p-4 text-right font-medium text-slate-900">
                              {trx.balance !== null ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(trx.balance) : '-'}
                            </td>
                            <td className="p-4">
                              <input 
                                type="text" 
                                value={trx.category} 
                                onChange={(e) => handleCategoryChange(idx, e.target.value)}
                                className="w-32 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#004b87]"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => handleDeleteRow(idx)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {transactions.length > 0 && !isExtracting && (
              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSaving ? "Menyimpan..." : "Simpan ke Cashflow"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
