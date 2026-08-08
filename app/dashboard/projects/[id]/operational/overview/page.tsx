"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, PieChart, Activity, FileText } from "lucide-react";
import { fetchOpsAction } from "@/app/lib/actions/opsActions";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface OperationalCost {
  ops_id: string;
  date: string | Date;
  item: string;
  total: number;
}

const COLORS = ["#00a3e0", "#004b87", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function OpsOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const BUDGET = 100000000;

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchOpsAction();
        if (res.success && res.data) {
          setCosts(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const totalExpense = costs.reduce((acc, curr) => acc + Number(curr.total), 0);
  const remainingBudget = BUDGET - totalExpense;
  const budgetPercentage = Math.min((totalExpense / BUDGET) * 100, 100).toFixed(1);

  const categoryData = costs.reduce((acc: any, curr) => {
    const cat = curr.item.split(" - ")[0] || "Others";
    acc[cat] = (acc[cat] || 0) + Number(curr.total);
    return acc;
  }, {});

  const pieData = Object.keys(categoryData).map((cat) => ({
    name: cat,
    value: categoryData[cat],
  }));

  const top5Costs = [...costs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 text-slate-100 light:text-slate-900 animate-in fade-in duration-500 flex flex-col">
      <header className="mb-8">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-4xl text-white light:text-slate-900 flex items-center gap-3">
            <PieChart className="w-10 h-10 text-brand-cyan" />
            Operational Overview
          </p>
          <p className="font-medium text-slate-400 light:text-slate-500 text-lg">
            Ringkasan data pengeluaran dan serapan anggaran operasional proyek.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KPI 1: Total Expense */}
        <div className="flex flex-col lg:col-span-4 bg-dark-card light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-bl-full pointer-events-none" />
            <p className="text-sm font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-2">Total Expense</p>
            <p className="text-3xl font-extrabold text-brand-cyan">{formatIDR(totalExpense)}</p>
            <div className="mt-4 pt-4 border-t border-slate-800 light:border-slate-200">
               <p className="text-xs text-slate-400 light:text-slate-500 mb-1 flex justify-between">
                 <span>Budget Usage</span>
                 <span className="text-white light:text-slate-900 font-bold">{budgetPercentage}%</span>
               </p>
               <div className="w-full bg-slate-800 light:bg-slate-200 rounded-full h-1.5">
                 <div className="bg-brand-cyan h-1.5 rounded-full" style={{ width: `${budgetPercentage}%` }}></div>
               </div>
            </div>
        </div>

        {/* KPI 2: Total Budget */}
        <div className="flex flex-col lg:col-span-4 bg-dark-card light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl p-6 shadow-lg justify-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-white light:text-slate-900">{formatIDR(BUDGET)}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
        </div>

        {/* KPI 3: Remaining Budget */}
        <div className="flex flex-col lg:col-span-4 bg-dark-card light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl p-6 shadow-lg justify-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-1">Remaining Budget</p>
                <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatIDR(remainingBudget)}</p>
              </div>
              <div className={`p-3 rounded-xl ${remainingBudget < 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                <Activity className={`w-6 h-6 ${remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
              </div>
            </div>
        </div>

        {/* Snapshot Table */}
        <div className="flex flex-col lg:col-span-8 bg-dark-card light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-800/80 light:border-slate-200 bg-dark-bg/50 light:bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-white light:text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-cyan" /> 5 Transaksi Terbaru
              </h3>
              <Link href={`/dashboard/projects/${id}/operational/report`} className="text-xs font-semibold text-brand-cyan hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-slate-800/80 light:divide-slate-200 p-2">
              {top5Costs.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">Tidak ada transaksi terbaru.</div>
              )}
              {top5Costs.map(cost => {
                const itemParts = cost.item.split(" - ");
                const cat = itemParts.length > 1 ? itemParts[0] : "Others";
                const desc = itemParts.length > 1 ? itemParts.slice(1).join(" - ") : cost.item;
                const dateDisplay = cost.date instanceof Date ? cost.date.toISOString().split("T")[0] : String(cost.date).split("T")[0];

                return (
                  <div key={cost.ops_id} className="flex items-center justify-between p-4 hover:bg-white/5 light:hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white light:text-slate-900">{desc}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">{cat}</span>
                        <span className="text-xs text-slate-500">{dateDisplay}</span>
                      </div>
                    </div>
                    <div className="font-bold text-brand-cyan text-sm">
                      {formatIDR(cost.total)}
                    </div>
                  </div>
                );
              })}
            </div>
        </div>

        {/* Pie Chart */}
        <div className="flex flex-col lg:col-span-4 bg-dark-card light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-lg text-white light:text-slate-900 mb-6 flex items-center gap-2">
               <PieChart className="w-5 h-5 text-brand-cyan" /> Pengeluaran Berdasarkan Kategori
            </h3>
            <div className="h-64 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatIDR(value)}
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                   Belum ada data pengeluaran
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
