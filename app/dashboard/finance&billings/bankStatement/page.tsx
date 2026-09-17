"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Activity,
  ArrowRightLeft,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { getInvoices } from "@/app/lib/actions/invoiceActions";
import { fetchOpsAction } from "@/app/lib/actions/opsActions";
import { getBankTransactions } from "@/app/lib/actions/bankActions";
import BankStatementImporter from "./BankStatementImporter";
import TaxMarkModal from "./TaxMarkModal";

const COLORS = [
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

interface Transaction {
  id: string;
  date: Date;
  dateString: string; // for display
  description: string;
  type: "IN" | "OUT";
  amount: number;
  category?: string;
}

export default function CashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [selectedTaxTx, setSelectedTaxTx] = useState<Transaction | null>(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [invRes, opsRes, bankRes] = await Promise.all([
          getInvoices(),
          fetchOpsAction(),
          getBankTransactions(),
        ]);

        const merged: Transaction[] = [];

        // Parse OpsOasis (Cash Out)
        if (opsRes.success && opsRes.data) {
          opsRes.data.forEach((ops: any) => {
            const d = new Date(ops.date);
            merged.push({
              id: ops.ops_id?.toString() || `ops-${Math.random()}`,
              date: d,
              dateString: d.toLocaleDateString("id-ID"),
              description: ops.item || "Operational Cost",
              type: "OUT",
              amount: Number(ops.total) || 0,
              category: "Operasional",
            });
          });
        }

        // Parse Bank Transactions
        if (bankRes.success && bankRes.data) {
          bankRes.data.forEach((trx: any) => {
            const d = new Date(trx.date);
            const isCredit = Number(trx.credit) > 0;
            const amount = isCredit ? Number(trx.credit) : Number(trx.debit);

            merged.push({
              id: trx.id || `bank-${Math.random()}`,
              date: d,
              dateString: d.toLocaleDateString("id-ID"),
              description: trx.description || "Bank Transaction",
              type: isCredit ? "IN" : "OUT",
              amount: amount || 0,
              category: trx.category || "Lain-lain",
            });
          });
        }

        // Sort desc (newest first)
        merged.sort((a, b) => b.date.getTime() - a.date.getTime());
        setTransactions(merged);
      } catch (err) {
        console.error("Failed to load cashflow data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [refreshCount]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      const y = t.date.getFullYear();
      const m = String(t.date.getMonth() + 1).padStart(2, "0");
      months.add(`${y}-${m}`);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (selectedMonth !== "ALL") {
      filtered = filtered.filter((t) => {
        const y = t.date.getFullYear();
        const m = String(t.date.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}` === selectedMonth;
      });
    }
    
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }
    
    return filtered;
  }, [transactions, selectedMonth, typeFilter]);

  const { totalIn, totalOut, netCashFlow, chartData, pieChartData } =
    useMemo(() => {
      let tIn = 0;
      let tOut = 0;

      // Build chart data grouped by YYYY-MM
      const monthlyMap: Record<
        string,
        { month: string; CashIn: number; CashOut: number; order: string }
      > = {};

      const categoryMap: Record<string, number> = {};

      filteredTransactions.forEach((t) => {
        if (t.type === "IN") tIn += t.amount;
        else {
          tOut += t.amount;
          // Group OUT transactions for pie chart
          const cat = t.category || "Lain-lain";
          categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
        }

        // for chart
        const y = t.date.getFullYear();
        const m = String(t.date.getMonth() + 1).padStart(2, "0");
        const key = `${y}-${m}`;

        const monthName = t.date.toLocaleString("id-ID", {
          month: "short",
          year: "numeric",
        });

        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            month: monthName,
            CashIn: 0,
            CashOut: 0,
            order: key,
          };
        }

        if (t.type === "IN") monthlyMap[key].CashIn += t.amount;
        else monthlyMap[key].CashOut += t.amount;
      });

      const cData = Object.values(monthlyMap).sort((a, b) =>
        a.order.localeCompare(b.order),
      );

      const pData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      return {
        totalIn: tIn,
        totalOut: tOut,
        netCashFlow: tIn - tOut,
        chartData: cData,
        pieChartData: pData,
      };
    }, [filteredTransactions]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-brand-cyan animate-pulse" />
          <p className="text-sm font-medium text-slate-500">
            Memuat Data Kas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#004b87]" />
              Bank Statement Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Pemantauan arus kas masuk dan keluar perusahaan secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none text-slate-700"
              >
                <option value="ALL">Semua Bulan</option>
                {availableMonths.map((m) => {
                  const [y, mo] = m.split("-");
                  const date = new Date(Number(y), Number(mo) - 1);
                  const label = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
            </div>
            <BankStatementImporter
              onImportSuccess={() => setRefreshCount((prev) => prev + 1)}
            />
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowDownRight className="w-24 h-24 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              Total Pemasukan (Cash In)
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              {formatIDR(totalIn)}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Berdasarkan mutasi riil (Bank Statement)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ArrowUpRight className="w-24 h-24 text-rose-500" />
            </div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              Total Pengeluaran (Cash Out)
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              {formatIDR(totalOut)}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Berdasarkan data operational cost  <br />& Bank statement
            </p>
          </div>

          <div
            className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden group transition-all duration-300 ${netCashFlow >= 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 text-white" : "bg-gradient-to-br from-rose-500 to-rose-700 border-rose-600 text-white"}`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
              <ArrowRightLeft className="w-24 h-24" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/80">
              Net Cash Flow
            </p>
            <h2 className="text-3xl font-bold">{formatIDR(netCashFlow)}</h2>
            <p className="text-xs text-white/60 mt-2">
              Selisih Pemasukan & Pengeluaran
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="flex flex-row gap-6">
          <div className="w-[70%] bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900">
                Grafik Arus Kas Bulanan
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan pemasukan dan pengeluaran tiap bulan.
              </p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(value) => "Rp" + value / 1000000 + "M"}
                  />
                  <Tooltip
                    formatter={(value: any) => formatIDR(Number(value))}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                  />
                  <Bar
                    dataKey="CashIn"
                    name="Pemasukan"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="CashOut"
                    name="Pengeluaran"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="w-[30%] bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900">
                Kategori Pengeluaran
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi berdasarkan kategori.
              </p>
            </div>
            <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatIDR(Number(value))}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400">Belum ada data.</p>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Riwayat Transaksi Gabungan
              </h3>
              <p className="text-xs text-slate-500">
                Histori pergerakan dana masuk dan keluar.
              </p>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "ALL" | "IN" | "OUT")}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-slate-700 font-medium"
              >
                <option value="ALL">All</option>
                <option value="IN">Income</option>
                <option value="OUT">Expanse</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-white">
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">
                    Tanggal
                  </th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">
                    Deskripsi
                  </th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px]">
                    Tipe Transaksi
                  </th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px] text-right">
                    Nominal (Rp)
                  </th>
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[11px] text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.map((trx, idx) => (
                  <tr
                    key={trx.id + idx}
                    className="hover:bg-slate-50/50 transition group"
                  >
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {trx.dateString}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {trx.description}
                    </td>
                    <td className="py-4 px-6">
                      {trx.type === "IN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <ArrowDownRight className="w-3 h-3" /> Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                          <ArrowUpRight className="w-3 h-3" /> Pengeluaran
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-bold whitespace-nowrap ${trx.type === "IN" ? "text-emerald-600" : "text-slate-900"}`}
                    >
                      {trx.type === "IN" ? "+" : "-"}
                      {formatIDR(trx.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedTaxTx(trx);
                          setIsTaxModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-colors shadow-sm text-xs font-semibold whitespace-nowrap"
                        title="Tandai sebagai Pajak"
                      >
                        Tandai Pajak
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada pergerakan kas tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <TaxMarkModal 
        isOpen={isTaxModalOpen} 
        onClose={() => setIsTaxModalOpen(false)} 
        transaction={selectedTaxTx}
        onSuccess={() => {
          alert("Transaksi berhasil ditandai sebagai objek pajak!");
          // Optional: we don't strictly need to refresh if we don't show the mark on this table,
          // but we could refresh if we want to show a 'Tax' badge later.
        }}
      />
    </div>
  );
}
