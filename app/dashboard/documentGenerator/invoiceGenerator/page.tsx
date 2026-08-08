"use client";

import React, { useState, useEffect } from "react";
import { FileText, Plus, Printer, Trash2 } from "lucide-react";

export default function InvoiceGenerator() {
  // State untuk data form invoice
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    invoiceDate: "",
    customerName: "",
    customerAddress: "",
    up: "",
    phone: "",
    items: [
      {
        description: "",
        qty: 0,
        price: 0,
      },
    ],
  });

  // Handler untuk mengubah data form
  const handleChange = (e: any, index?: number, field?: string) => {
    if (field && typeof index === "number") {
      // Untuk item tabel yang dinamis
      const newItems = [...invoiceData.items];
      newItems[index] = {
        ...newItems[index],
        [field]: e.target.value,
      };
      setInvoiceData({ ...invoiceData, items: newItems });
    } else {
      // Untuk field utama
      setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
    }
  };

  // Fungsi Tambah Baris Item Pekerjaan
  const addItemRow = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: "", qty: 0, price: 0 }],
    });
  };

  // Fungsi Hapus Baris Item Pekerjaan Terakhir
  const removeLastItemRow = () => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.slice(0, -1),
      });
    }
  };

  // Update document title secara real-time agar browser mengenali nama file
  useEffect(() => {
    document.title = invoiceData.invoiceNo
      ? invoiceData.invoiceNo.replace(/\//g, "_")
      : "Invoice";
  }, [invoiceData.invoiceNo]);

  // Fungsi Cetak / Save to PDF
  const handlePrint = async () => {
    const originalTitle = document.title;

    const customFileName = invoiceData.invoiceNo.replace(/\//g, "-");
    document.title = customFileName;

    // Simpan ke database sebelum cetak
    if (invoiceData.invoiceNo) {
      try {
        const { saveInvoiceData } = await import("@/app/lib/actions/invoiceActions");
        const res = await saveInvoiceData(
          invoiceData.invoiceNo,
          invoiceData.customerName,
          invoiceData.invoiceDate,
          dpp,
          invoiceData.customerAddress,
          invoiceData.up,
          invoiceData.phone,
          invoiceData.items
        );
        
        if (res.success && res.inserted === false) {
          alert("Peringatan: Nomor Invoice sudah digunakan. Silakan gunakan Nomor Invoice yang berbeda sebelum mencetak.");
          return; // Hentikan proses cetak
        }
      } catch (error) {
        console.error("Gagal menyimpan invoice:", error);
      }
    }

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Helper untuk parsing Qty yang bisa jadi persentase
  const parseQty = (qty: string | number) => {
    const qtyStr = String(qty).trim();
    if (qtyStr.endsWith("%")) {
      const num = parseFloat(qtyStr.replace("%", ""));
      return isNaN(num) ? 0 : num / 100;
    }
    const num = parseFloat(qtyStr);
    return isNaN(num) ? 0 : num;
  };

  // Kalkulasi Otomatis Total
  const subtotal = invoiceData.items.reduce(
    (acc, item) => acc + parseQty(item.qty) * Number(item.price),
    0,
  );
  const dpp = Math.round((subtotal * 11) / 12); // DPP Nilai Lain Nya
  const vat = Math.round(dpp * 0.12); // PPN 12%
  const grandTotal = subtotal + vat;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 max-w-7xl mx-auto p-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KOLOM KIRI: FORM INPUT (Tidak akan ikut tercetak) */}
        <div className="rounded-2xl bg-[#121826]/90 light:bg-white p-6 border border-slate-800/80 light:border-slate-200 shadow-lg print:hidden">
          <h2 className="text-xl font-bold mb-6 text-white light:text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-cyan" />
            <span>Form Input Invoice</span>
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1">
                  No. Invoice
                </label>
                <input
                  placeholder="Input No Invoice"
                  type="text"
                  name="invoiceNo"
                  value={invoiceData.invoiceNo}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1">
                  Tanggal Invoice
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  placeholder="DD/MM/YYYY"
                  value={invoiceData.invoiceDate}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1">
                Nama Customer
              </label>
              <input
                placeholder="Input Nama Customer"
                type="text"
                name="customerName"
                value={invoiceData.customerName}
                onChange={handleChange}
                className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1">
                Alamat Customer
              </label>
              <textarea
                placeholder="Input Alamat Customer"
                name="customerAddress"
                rows={3}
                value={invoiceData.customerAddress}
                onChange={handleChange}
                className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1">
                  UP (Untuk Perhatian)
                </label>
                <input
                  placeholder="Input Nama UP"
                  type="text"
                  name="up"
                  value={invoiceData.up}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1">
                  No. Telepon
                </label>
                <input
                  placeholder="Input No. Telepon"
                  type="text"
                  name="phone"
                  value={invoiceData.phone}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
              </div>
            </div>

            {/* Bagian Item Pekerjaan */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-2">
                Rincian Item Pekerjaan
              </label>
              {invoiceData.items.map((item, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 bg-slate-900/50 light:bg-slate-50 rounded-xl mb-3 border border-slate-800/80 light:border-slate-200"
                >
                  <label
                    htmlFor=""
                    className="block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1"
                  >
                    Deskripsi Pekerjaan
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Deskripsi Pekerjaan"
                    value={item.description}
                    onChange={(e) => handleChange(e, index, "description")}
                    className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor=""
                        className="ml-2 block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1"
                      >
                        Qty (HA)
                      </label>
                      <input
                        type="text"
                        placeholder="Qty (HA)"
                        value={item.qty}
                        onChange={(e) => handleChange(e, index, "qty")}
                        className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor=""
                        className="ml-2 block text-xs font-semibold text-slate-400 light:text-slate-500 mb-1"
                      >
                        Price
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Harga Satuan (Rp)"
                        value={
                          item.price
                            ? Number(item.price).toLocaleString("en-US")
                            : ""
                        }
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                          handleChange(
                            { target: { value: rawValue } },
                            index,
                            "price",
                          );
                        }}
                        className="w-full p-2 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={addItemRow}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 light:bg-slate-100 hover:bg-slate-800 text-xs font-medium text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 transition-colors border border-slate-700/50 light:border-slate-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Item
                </button>
                {invoiceData.items.length > 1 && (
                  <button
                    onClick={removeLastItemRow}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/30 light:bg-red-50 hover:bg-red-900/50 light:hover:bg-red-100 text-xs font-medium text-red-400 light:text-red-600 hover:text-red-300 light:hover:text-red-700 transition-colors border border-red-900/50 light:border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Item
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full mt-6 inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-brand-cyan/25 hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <Printer className="w-4 h-4" />
              Download / Cetak PDF Invoice
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: LIVE PREVIEW INVOICE (Area yang akan dicetak) */}
        <div
          className="bg-white p-6 border border-slate-200 text-black font-sans text-[10px] leading-tight flex flex-col gap-12 shadow-xl mx-auto w-full"
          id="invoice-printable"
          // style={{ minHeight: "297mm" }}
        >
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
                  style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
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
                    {invoiceData.customerName}
                  </div>
                  <div className="font-bold text-black uppercase whitespace-pre-wrap">
                    {invoiceData.customerAddress}
                  </div>
                  {/* <div className="font-bold text-black uppercase">
                    TELP.{invoiceData.phone}
                  </div> */}
                </div>
              </div>

              <div className="flex w-2/5 justify-end">
                <table className="font-bold text-black uppercase text-left w-full max-w-xs">
                  <tbody>
                    <tr>
                      <td className="w-32 pb-0.5">INVOICE NO</td>
                      <td className="pb-0.5">{invoiceData.invoiceNo}</td>
                    </tr>
                    <tr>
                      <td className="pb-0.5">INVOICE DATE</td>
                      <td className="pb-0.5">{invoiceData.invoiceDate}</td>
                    </tr>
                    <tr>
                      <td className="pb-0.5">UP</td>
                      <td className="pb-0.5">{invoiceData.up}</td>
                    </tr>
                    <tr>
                      <td className="capitalize">Telepon</td>
                      <td>{invoiceData.phone}</td>
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
                {invoiceData.items.map((item, idx) => {
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
                        {subtotal.toLocaleString("en-US")}
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
                        {dpp.toLocaleString("en-US")}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1">VAT 12 %</td>
                      <td className="border-t border-b border-l border-black p-1">
                        Rp
                      </td>
                      <td className="border-t border-b border-r border-black p-1 text-right">
                        {vat.toLocaleString("en-US")}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-1">GRAN TOTAL</td>
                      <td className="border-t border-b border-l border-black p-1">
                        Rp
                      </td>
                      <td className="border-t border-b border-r border-black p-1 text-right">
                        {grandTotal.toLocaleString("en-US")}
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
                Makassar , {invoiceData.invoiceDate}
              </div>
              <div className="text-left mb-16">Hormat Kami</div>
              <div className="underline uppercase whitespace-nowrap">
                HINDRAWAN HAMID MUSA,ST
              </div>
              <div className="text-left w-full">DIREKTUR UTAMA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
