"use client"

import React, { useState } from 'react';

interface InvoiceItem {
  id: string;
  client: string;
  date: string;
  amount: number; // Nilai Invoice
  status: 'Paid' | 'Pending' | 'Overdue';
}

export default function InvoiceTracker() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const { getInvoices } = await import('@/app/lib/actions/invoiceActions');
        const res = await getInvoices();
        if (res.success && res.data) {
          const formatted = res.data.map((row: any) => {
            // DB date is likely a Date object or string.
            let dateStr = row.date;
            if (row.date && typeof row.date !== 'string') {
               const d = new Date(row.date);
               dateStr = d.toLocaleDateString('en-GB'); // DD/MM/YYYY
            }

            return {
              id: row.invoice_id,
              client: row.customer,
              date: dateStr,
              amount: Math.round(Number(row.dpp) * 1.12), // DPP + PPN 12%
              status: row.status,
            };
          });
          setInvoices(formatted);
        }
      } catch (error) {
        console.error("Failed to load invoices", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleStatus = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin mengubah status invoice ini?")) {
      const currentInvoice = invoices.find(inv => inv.id === id);
      if (!currentInvoice) return;

      try {
        const { toggleInvoiceStatus } = await import('@/app/lib/actions/invoiceActions');
        const res = await toggleInvoiceStatus(id, currentInvoice.status);
        if (res.success) {
          setInvoices(prev => prev.map(inv => {
            if (inv.id === id) {
              return { ...inv, status: res.newStatus as any };
            }
            return inv;
          }));
        }
      } catch (error) {
        console.error("Failed to toggle status", error);
      }
    }
  };

  const totalInvoiced = invoices.reduce((acc, item) => acc + item.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, item) => acc + item.amount, 0);
  const totalPending = invoices.filter(i => i.status !== 'Paid').reduce((acc, item) => acc + item.amount, 0);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">PT Survey Teknologi Indonesia</span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">Invoice Tracker</h1>
            <p className="text-sm text-slate-500">Pantau status pembayaran invoice klien</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              Export Data
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{formatIDR(totalInvoiced)}</p>
            <span className="text-xs text-slate-400 mt-1 inline-block">Seluruh tagihan yang diterbitkan</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-950 mt-2">{formatIDR(totalPaid)}</p>
            <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Tagihan yang sudah lunas</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Total Pending</p>
            <p className="text-2xl font-bold text-amber-950 mt-2">{formatIDR(totalPending)}</p>
            <span className="text-xs text-amber-600 font-medium mt-1 inline-block">Menunggu pembayaran klien</span>
          </div>
        </div>

        {/* TABEL RINCIAN INVOICE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Daftar Invoice</h2>
            <span className="text-xs text-slate-500">Real-time update</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-6 font-semibold">No. Invoice</th>
                  <th className="py-3 px-6 font-semibold">Klien / Customer</th>
                  <th className="py-3 px-6 font-semibold">Tanggal</th>
                  <th className="py-3 px-6 font-semibold text-right">Nilai Tagihan (Rp)</th>
                  <th className="py-3 px-6 font-semibold text-center">Status</th>
                  <th className="py-3 px-6 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-900">{inv.id}</td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{inv.client}</td>
                    <td className="py-4 px-6 text-slate-500">{inv.date}</td>
                    <td className="py-4 px-6 text-right font-medium text-slate-900">{formatIDR(inv.amount)}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {inv.status === 'Pending' && (
                        <button
                          onClick={() => toggleStatus(inv.id)}
                          className="text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-colors border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}