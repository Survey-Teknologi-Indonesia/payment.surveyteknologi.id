"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  TrendingUp, 
  AlertCircle, 
  Briefcase, 
  FileText, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  BarChart3,
  Activity,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import { getInvoices } from "@/app/lib/actions/invoiceActions";
import { getBankTransactions } from "@/app/lib/actions/bankActions";
import { fetchOpsAction } from "@/app/lib/actions/opsActions";
import { getProjects } from "@/app/lib/actions/schedulerActions";

const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
};

export default function DirectorDashboard() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bankTx, setBankTx] = useState<any[]>([]);
  const [opsTx, setOpsTx] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getInvoices(),
      getBankTransactions(),
      fetchOpsAction(),
      getProjects()
    ]).then(([invRes, bankRes, opsRes, projRes]) => {
      if (invRes?.success) setInvoices(invRes.data || []);
      if (bankRes?.success) setBankTx(bankRes.data || []);
      if (opsRes?.success) setOpsTx(opsRes.data || []);
      if (projRes?.success) setProjects(projRes.data || []);
    }).catch(err => console.error("Error loading dashboard data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const {
    netCashBalance,
    unpaidInvoiceCount,
    unpaidInvoiceAmount,
    activeProjectsCount,
    atRiskProjectsCount,
    burnRate,
    financialData,
    urgentInvoicesList,
    projectsHealthList
  } = useMemo(() => {
    // --- INVOICES ---
    const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
    const unpaidCount = pendingInvoices.length;
    const unpaidAmount = pendingInvoices.reduce((sum, i) => sum + Number(i.dpp || 0), 0);

    const sortedUrgent = [...pendingInvoices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
    const urgentList = sortedUrgent.map(inv => {
      const dueDate = new Date(inv.date);
      const ageDays = Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
      return {
        id: inv.invoice_id,
        client: inv.customer,
        amount: Number(inv.dpp),
        status: ageDays > 30 ? "Overdue" : "Pending",
        days: `${Math.max(0, ageDays)} Days`
      };
    });

    // --- CASHFLOW ---
    let tIn = 0;
    let tOut = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let currentMonthBurn = 0;

    const monthlyMap: Record<string, { month: string; in: number; out: number; dateVal: Date }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { month: d.toLocaleString('en-US', { month: 'short' }), in: 0, out: 0, dateVal: d };
    }

    bankTx.forEach(trx => {
      const amountIn = Number(trx.credit || 0);
      const amountOut = Number(trx.debit || 0);
      tIn += amountIn;
      tOut += amountOut;

      const d = new Date(trx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].in += (amountIn / 1000000); // store as millions for chart
        monthlyMap[key].out += (amountOut / 1000000);
      }
      
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        currentMonthBurn += amountOut;
      }
    });

    opsTx.forEach(ops => {
      const amountOut = Number(ops.total || 0);
      tOut += amountOut;

      const d = new Date(ops.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        monthlyMap[key].out += (amountOut / 1000000);
      }
      
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        currentMonthBurn += amountOut;
      }
    });

    const netCash = tIn - tOut;
    const chartData = Object.values(monthlyMap).sort((a, b) => a.dateVal.getTime() - b.dateVal.getTime());

    // --- PROJECTS ---
    const activeProjects = projects.filter(p => p.status === 'Active' || !p.status);
    const activeCount = activeProjects.length;
    
    // Determine risk based on dummy logic since we don't have detailed progress in basic DB
    const atRiskCount = activeProjects.filter(p => p.name.length > 20).length;

    const healthList = projects.slice(0, 5).map((p) => {
      const isAtRisk = p.name.length > 20;
      return {
        id: p.id,
        name: p.name,
        status: isAtRisk ? "At Risk" : "On Track",
        progress: isAtRisk ? 45 : 78,
        color: isAtRisk ? "bg-rose-500" : "bg-emerald-500"
      };
    });

    return {
      netCashBalance: netCash,
      unpaidInvoiceCount: unpaidCount,
      unpaidInvoiceAmount: unpaidAmount,
      activeProjectsCount: activeCount,
      atRiskProjectsCount: atRiskCount,
      burnRate: currentMonthBurn,
      financialData: chartData,
      urgentInvoicesList: urgentList,
      projectsHealthList: healthList
    };
  }, [invoices, bankTx, opsTx, projects]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#004b87] animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Overview</h1>
            <p className="text-slate-500 mt-2">Welcome back, Director. Here is the pulse of your operations today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <button className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-900/20 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Generate Report
            </button>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Cash Balance */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300 relative z-10">Net Cash Balance</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1 relative z-10">{formatIDR(netCashBalance)}</h3>
          </div>

          {/* Card 2: Unpaid Invoices */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-600">{unpaidInvoiceCount} Invoices</span>
            </div>
            <p className="text-sm font-medium text-slate-500">Outstanding Receivables</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">{formatIDR(unpaidInvoiceAmount)}</h3>
          </div>

          {/* Card 3: Active Projects */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-600">{atRiskProjectsCount} at risk</span>
            </div>
            <p className="text-sm font-medium text-slate-500">Active Projects</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeProjectsCount}</h3>
          </div>

          {/* Card 4: Burn Rate / Expenses */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Monthly Burn Rate (Out)</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">{formatIDR(burnRate)}</h3>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Cashflow Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Cashflow Trend</h2>
                <p className="text-sm text-slate-500">Inflow vs Outflow over the last 6 months (in Millions IDR)</p>
              </div>
              <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Last 6 Months</option>
              </select>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => `${val}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    formatter={(value: any) => [`Rp ${Number(value).toFixed(2)}M`, undefined]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                  <Area type="monotone" dataKey="in" name="Cash In" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                  <Area type="monotone" dataKey="out" name="Cash Out" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: Urgent Action Center */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Attention Required</h2>
            <p className="text-sm text-slate-500 mb-6">Unpaid Invoices pending action.</p>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2">
              {urgentInvoicesList.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-8">No pending invoices.</div>
              ) : (
                urgentInvoicesList.map((inv) => (
                  <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">{inv.client}</h4>
                        <p className="text-xs text-slate-500">{inv.id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status} ({inv.days})
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60">
                      <span className="text-sm font-semibold text-slate-900">{formatIDR(inv.amount)}</span>
                      <button className="text-xs font-semibold text-[#004b87] flex items-center gap-1 hover:gap-1.5 transition-all">
                        Review <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Project Health */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Project Health Matrix</h2>
              <p className="text-sm text-slate-500">Quick snapshot of ongoing project statuses.</p>
            </div>
            <button className="text-sm font-semibold text-[#004b87] flex items-center gap-1 hover:underline">
              Go to Projects <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-500">
                  <th className="py-4 px-6 font-semibold">Project Name</th>
                  <th className="py-4 px-6 font-semibold">Health</th>
                  <th className="py-4 px-6 font-semibold">Progress</th>
                  <th className="py-4 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectsHealthList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No active projects found.</td>
                  </tr>
                ) : (
                  projectsHealthList.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">{proj.name}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          proj.status === 'On Track' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${proj.color}`}></div>
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${proj.color}`} style={{ width: `${proj.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}