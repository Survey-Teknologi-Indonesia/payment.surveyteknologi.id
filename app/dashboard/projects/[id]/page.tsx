"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Circle,
  FileText,
  Download,
  Building,
  UploadCloud,
  MapPin,
} from "lucide-react";
import InvoicePage from "./invoice/page";
import Image from "next/image";

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Dummy data based on params.id
  const project = {
    id: id,
    client: "PLN Electricity Services",
    name: "Inspeksi Jaringan Transmisi SUTET",
    wbs: "WBS-2026-001",
  };

  // Dummy Work Orders (empty array to show empty state)
  const workOrders: any[] = [];

  // Operational stages state
  const [stages, setStages] = useState([
    {
      id: 1,
      name: "Survey Lokasi & Kickoff",
      status: "completed",
      date: "Oct 12",
    },
    {
      id: 2,
      name: "Working Permit (Izin Kerja)",
      status: "completed",
      date: "Oct 15",
    },
    {
      id: 3,
      name: "Akuisisi Data Lapangan (OASIS)",
      status: "completed",
      date: "Oct 28",
    },
    {
      id: 4,
      name: "Data Processing & Reporting",
      status: "in-progress",
      date: "Nov 02",
    },
    { id: 5, name: "Penyerahan Hasil (BAPP)", status: "pending", date: "-" },
    { id: 6, name: "Penagihan (Invoice)", status: "pending", date: "-" },
  ]);

  const toggleStage = (id: number) => {
    setStages(
      stages.map((s) => {
        if (s.id === id) {
          if (s.status === "completed") return { ...s, status: "pending" };
          if (s.status === "pending") return { ...s, status: "in-progress" };
          return { ...s, status: "completed" };
        }
        return s;
      }),
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 text-slate-100 light:text-slate-900">
      {/* 1. Top Navigation */}
      <div className="mb-2">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-slate-400 light:text-slate-500 hover:text-slate-200 light:hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Projects
        </Link>
      </div>

      {/* 2. Page Header (Linear Style) */}
      <header>
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-bold text-5xl">OASIS PLN ES</p>
            <p className="font-semibold text-lg">
              Over-headlines Asset Surveillance & Inspection System
            </p>
          </div>
          <div className="relative w-48 h-16">
            <Image
              src={"/assets/image/logo-PLN.png"}
              alt="LOGO PLN"
              fill
              className="object-contain"
            />
          </div>
        </div>
        {/* <p className="font-bold text-2xl">WBS-2026-001</p> */}
      </header>

      {/* 3. Executive Summary */}
      <section className="mt-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-xl font-bold mb-6 text-white light:text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-cyan" />
          Executive Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-slate-400 light:text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider">
                Next Location
              </span>
            </div>
            <span className="text-lg font-bold text-white light:text-slate-900">
              -
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-400 light:text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider">
                Latest PO
              </span>
            </div>
            <span className="text-lg font-bold text-white light:text-slate-900">
              DD:MM:YYYY
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-4 h-4 text-slate-400 light:text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider">
                Total Span
              </span>
            </div>
            <span className="text-lg font-bold text-brand-cyan">-</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-slate-400 light:text-slate-500" />
              <span className="text-xs font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider">
                Total PO
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white light:text-slate-900">
                -
              </span>
              <span className="text-xs font-medium text-emerald-400"></span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Lokasi Proyek (Map) */}
      <section
        className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: "150ms", animationFillMode: "both" }}
      >
        {/* <h2 className="text-xl font-bold mb-6 text-white light:text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-cyan" />
          Lokasi Proyek
        </h2> */}
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800/80 light:border-slate-200 shadow-lg relative bg-[#090d16]/80 p-2">
          <div className="w-full h-full rounded-xl overflow-hidden relative">
            <iframe
              src="https://maps.google.com/maps?q=Pulau%20Jawa,%20Indonesia&t=&z=7&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              className="border-0 opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700"
              style={{ filter: "invert(90%) hue-rotate(180deg) contrast(85%)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            {/* Overlay gradient untuk styling agar lebih menyatu dengan dark theme */}
            <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-white/10"></div>
          </div>
        </div>
      </section>

      {/* 5. Work Order (WO) Tracking */}
      <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
        <h2 className="text-xl font-bold mb-6 text-white light:text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-cyan" />
          Work Order Tracking
        </h2>
        <div className="bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 light:text-slate-600">
              <thead className="text-xs text-slate-400 light:text-slate-500 uppercase bg-[#090d16]/80 light:bg-slate-50 border-b border-slate-800/80 light:border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">No</th>
                  <th scope="col" className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal Terbit</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Nama WO</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Jumlah Span</th>
                  <th scope="col" className="px-6 py-4 font-semibold whitespace-nowrap">Tanggal Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 light:divide-slate-200">
                {workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText className="w-10 h-10 text-slate-500/50 light:text-slate-300" />
                        <p className="text-slate-400 light:text-slate-500 font-medium">
                          Belum ada Work Order yang tersedia.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  workOrders.map((wo, index) => (
                    <tr key={index} className="hover:bg-white/5 light:hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white light:text-slate-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{wo.tanggalTerbit}</td>
                      <td className="px-6 py-4 font-medium text-brand-cyan whitespace-nowrap">{wo.namaWO}</td>
                      <td className="px-6 py-4">{wo.jumlahSpan}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 light:bg-emerald-100 light:text-emerald-700 border border-emerald-500/20 light:border-emerald-200">
                          {wo.tanggalSelesai}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
    // <InvoicePage params={params} />
  );
}
