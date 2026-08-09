"use client"

import React, { useState } from 'react';

interface InvoiceItem {
  id: string;
  client: string;
  date: string;
  amount: number; // Nilai Invoice
  status: 'Paid' | 'Pending' | 'Overdue';
  customerAddress?: string;
  up?: string;
  phone?: string;
  items?: any[];
  dpp?: number;
}
const parseQty = (qtyStr: string | number) => {
  if (typeof qtyStr === 'number') return qtyStr;
  const str = String(qtyStr).trim();
  if (str.endsWith('%')) {
    const num = parseFloat(str.replace('%', '').trim());
    return isNaN(num) ? 0 : num / 100;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

export default function InvoiceTracker() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);

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

              const parsedItems = row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [];
              const subtotal = parsedItems.reduce((acc: number, item: any) => acc + parseQty(item.qty) * Number(item.price), 0);
              const dpp = row.dpp ? Number(row.dpp) : Math.round(subtotal);
              const vat = Math.round(dpp * 0.12);
              const amount = subtotal + vat;

              return {
                id: row.invoice_id,
                client: row.customer,
                date: dateStr,
                amount: amount,
                status: row.status,
                customerAddress: row.customer_address,
                up: row.up,
                phone: row.phone,
                dpp: dpp,
                items: parsedItems
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

  const handleProcessPDF = async () => {
    if (!importFile) {
      alert("Pilih file PDF terlebih dahulu");
      return;
    }

    setIsParsing(true);
    setParseProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      // Simulate progress bar moving up to 90% while waiting for network
      const progressInterval = setInterval(() => {
        setParseProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const { parseInvoicePDF } = await import('@/app/lib/actions/pdfParserAction');
      const res = await parseInvoicePDF(formData);

      clearInterval(progressInterval);
      setParseProgress(100);

      setTimeout(() => {
        setIsParsing(false);
        setParseProgress(0);
        
        if (res.success) {
          alert("Berhasil! " + res.message);
          setIsImportModalOpen(false);
          setImportFile(null);
          window.location.reload(); // Reload to fetch new data
        } else {
          alert("Gagal: " + res.message);
        }
      }, 500);

    } catch (error) {
      console.error(error);
      setIsParsing(false);
      setParseProgress(0);
      alert("Terjadi kesalahan sistem saat memproses PDF.");
    }
  };

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

  let modalSubtotal = 0;
  if (selectedInvoice && selectedInvoice.items) {
    modalSubtotal = selectedInvoice.items.reduce((acc, item) => acc + parseQty(item.qty) * Number(item.price), 0);
  }
  const modalDpp = selectedInvoice?.dpp ? Math.round(selectedInvoice.dpp) : Math.round(modalSubtotal);
  const modalVat = Math.round(modalDpp * 0.12);
  const modalGrandTotal = modalSubtotal + modalVat;

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
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              Import PDF
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
                      <div className="flex flex-col items-center gap-1.5">
                        {inv.status === 'Pending' && (
                          <button
                            onClick={() => toggleStatus(inv.id)}
                            className="text-[10px] w-full font-semibold px-3 py-1.5 rounded-lg transition-colors border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          >
                            Tandai Lunas
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-[10px] w-full font-semibold px-3 py-1.5 rounded-lg transition-colors border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL LIHAT DETAIL */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Detail Invoice: {selectedInvoice.id}</h3>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600 transition">
                  Tutup
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 text-sm bg-slate-100">
                
                {/* INVOICE PREVIEW LAYOUT */}
                <div className="bg-white p-6 border border-slate-200 text-black font-sans text-[10px] leading-tight flex flex-col gap-12 shadow-sm mx-auto w-full">
                  <div className="w-full">
                    {/* Header: Logo and INVOICE text */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <img
                          src="/assets/image/logo.jpeg"
                          alt="Logo PT STI"
                          className="w-24 h-auto mb-2 object-contain"
                        />
                        <div className="font-bold text-[11px] mb-0.5 text-black">
                          PT SURVEY TEKNOLOGI INDONESIA
                        </div>
                        <div className="font-bold text-black">
                          Perumahan Golden Galaxi INN Block B no 7
                        </div>
                        <div className="font-bold text-black">
                          Jalan Waduk Tunggu Pampang - Kec Manggala Kota Makassar
                        </div>
                        <table className="mt-1 text-black">
                          <tbody>
                            <tr>
                              <td className="w-14">Phone</td>
                              <td>08115064378</td>
                            </tr>
                            <tr>
                              <td>Email</td>
                              <td>
                                <a
                                  href="mailto:indosurtek@gmail.com"
                                  className="text-blue-600 underline"
                                >
                                  indosurtek@gmail.com
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td>Web</td>
                              <td>
                                <a
                                  href="http://www.surveyteknologi.id"
                                  className="text-blue-600 underline"
                                >
                                  www.surveyteknologi.id
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="pt-4">
                        <div 
                          className="text-3xl font-black tracking-wider text-green-700 bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent opacity-90 italic drop-shadow-md"
                        >
                          INVOICE
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex justify-between mb-3">
                      <div className="flex w-3/5">
                        <div className="font-bold text-black w-20">
                          Costumer
                          <br />
                          Address
                        </div>
                        <div>
                          <div className="font-bold text-black uppercase">
                            {selectedInvoice.client}
                          </div>
                          <div className="font-bold text-black uppercase whitespace-pre-wrap">
                            {selectedInvoice.customerAddress}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-2/5 justify-end">
                        <table className="font-bold text-black uppercase text-left w-full max-w-xs">
                          <tbody>
                            <tr>
                              <td className="w-32 pb-0.5">INVOICE NO</td>
                              <td className="pb-0.5">{selectedInvoice.id}</td>
                            </tr>
                            <tr>
                              <td className="pb-0.5">INVOICE DATE</td>
                              <td className="pb-0.5">{selectedInvoice.date}</td>
                            </tr>
                            <tr>
                              <td className="pb-0.5">UP</td>
                              <td className="pb-0.5">{selectedInvoice.up}</td>
                            </tr>
                            <tr>
                              <td className="capitalize">Telepon</td>
                              <td>{selectedInvoice.phone}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table */}
                    <table className="w-full border-collapse border-2 border-black text-black mb-4">
                      <thead>
                        <tr className="bg-white">
                          <th className="border-2 border-black p-2 text-center w-12 font-bold">
                            ITEM
                          </th>
                          <th className="border-2 border-black p-2 text-left font-bold">
                            DESCRIPTION
                          </th>
                          <th className="border-2 border-black p-2 text-center w-24 font-bold">
                            QTY (HA)
                          </th>
                          <th
                            className="border-2 border-black p-2 text-center w-36 font-bold"
                            colSpan={2}
                          >
                            HARGA
                          </th>
                          <th
                            className="border-2 border-black p-2 text-center w-40 font-bold"
                            colSpan={2}
                          >
                            HARGA TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items?.map((item, idx) => {
                          const totalItem = parseQty(item.qty) * Number(item.price);
                          return (
                            <tr key={idx}>
                              <td className="border border-black p-2 text-center font-bold align-top">
                                {idx + 1}
                              </td>
                              <td className="border border-black p-2 font-bold align-top">
                                {item.description}
                              </td>
                              <td className="border border-black p-2 text-center font-bold align-top">
                                {item.qty}
                              </td>
                              <td className="border-t border-b border-l border-black p-2 font-bold w-8 align-top">
                                Rp
                              </td>
                              <td className="border-t border-b border-r border-black p-2 text-right font-bold align-top">
                                {Number(item.price).toLocaleString("en-US")}
                              </td>
                              <td className="border-t border-b border-l border-black p-2 font-bold w-8 align-top">
                                Rp
                              </td>
                              <td className="border-t border-b border-r border-black p-2 text-right font-bold align-top">
                                {totalItem.toLocaleString("en-US")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Totals & Bank Info */}
                    <div className="flex justify-between items-start mt-4">
                      <div className="font-bold text-black space-y-1.5 mt-1">
                        <div>No Rekening : 0343-01-282828-56-1</div>
                        <div>Rekening Bank BRI 0343 CABANG SOMBA OPU - MAKASSAR</div>
                        <div>An PT SURVEY TEKNOLOGI INDONESIA</div>
                      </div>

                      <div className="w-[300px]">
                        <table className="w-full border-collapse border-2 border-black font-bold text-black bg-white">
                          <tbody>
                            <tr>
                              <td className="border border-black p-1 w-32">TOTAL</td>
                              <td className="border-t border-b border-l border-black p-1 w-8">
                                Rp
                              </td>
                              <td className="border-t border-b border-r border-black p-1 text-right">
                                {modalSubtotal.toLocaleString("en-US")}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black p-1">
                                DPP NILAI LAIN NYA
                              </td>
                              <td className="border-t border-b border-l border-black p-1">
                                Rp
                              </td>
                              <td className="border-t border-b border-r border-black p-1 text-right">
                                {modalDpp.toLocaleString("en-US")}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black p-1">VAT 12 %</td>
                              <td className="border-t border-b border-l border-black p-1">
                                Rp
                              </td>
                              <td className="border-t border-b border-r border-black p-1 text-right">
                                {modalVat.toLocaleString("en-US")}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black p-1">GRAN TOTAL</td>
                              <td className="border-t border-b border-l border-black p-1">
                                Rp
                              </td>
                              <td className="border-t border-b border-r border-black p-1 text-right">
                                {modalGrandTotal.toLocaleString("en-US")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="flex justify-end w-full pr-10">
                    <div className="text-center font-bold text-black flex flex-col items-start w-56">
                      <div className="text-left mb-1">
                        Makassar , {selectedInvoice.date}
                      </div>
                      <div className="text-left mb-16">Hormat Kami</div>
                      <div className="underline uppercase whitespace-nowrap">
                        HINDRAWAN HAMID MUSA,ST
                      </div>
                      <div className="text-left w-full">DIREKTUR UTAMA</div>
                    </div>
                  </div>
                </div>
                {/* END INVOICE PREVIEW LAYOUT */}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition shadow-sm"
                >
                  Tutup Modal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL IMPORT PDF */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Import PDF</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                  Tutup
                </button>
              </div>
              <div className="p-6 space-y-4">
                {isParsing ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <p className="text-sm font-medium text-slate-700 mb-4">Sedang memproses dokumen...</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${parseProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{parseProgress}% selesai</p>
                  </div>
                ) : (
                  <form className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Pilih file PDF
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100 transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleProcessPDF}
                      className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!importFile}
                    >
                      Process PDF
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}