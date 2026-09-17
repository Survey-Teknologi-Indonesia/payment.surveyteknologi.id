"use client";

import React, { useState } from "react";
import { Plus, ArrowDownRight, ArrowUpRight, Wallet, Search, Filter, X, CheckCircle2, DollarSign } from "lucide-react";

type TxType = "INCOME" | "EXPENSE";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TxType;
  amount: number;
  category: string;
}

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", date: "2026-08-20", description: "Payment for Project A", type: "INCOME", amount: 12500000, category: "Project" },
    { id: "2", date: "2026-08-21", description: "Office Supplies", type: "EXPENSE", amount: 450000, category: "Operations" },
    { id: "3", date: "2026-08-23", description: "Software Licenses", type: "EXPENSE", amount: 2100000, category: "IT" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TxType>("INCOME");
  const [formData, setFormData] = useState({ date: "", description: "", amount: "", category: "" });

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const handleOpenModal = (type: TxType) => {
    setModalType(type);
    setFormData({ date: new Date().toISOString().split("T")[0], description: "", amount: "", category: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.description || !formData.amount) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.date,
      description: formData.description,
      type: modalType,
      amount: Number(formData.amount),
      category: formData.category || "Uncategorized"
    };

    setTransactions(prev => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
  };

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Cash Flow Tracker</h1>
            <p className="text-slate-500 mt-2">Manage your daily income and expenses with ease.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleOpenModal("EXPENSE")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-rose-100 text-rose-600 rounded-xl font-semibold hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
            <button 
              onClick={() => handleOpenModal("INCOME")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" /> Add Income
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-300">Total Balance</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{formatIDR(balance)}</div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full">+12% from last month</span>
             </div>
             <span className="block text-sm font-medium text-slate-500 mb-1">Total Income</span>
             <div className="text-2xl font-bold text-slate-900">{formatIDR(totalIncome)}</div>
          </div>

          {/* Expense */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full">-5% from last month</span>
             </div>
             <span className="block text-sm font-medium text-slate-500 mb-1">Total Expense</span>
             <div className="text-2xl font-bold text-slate-900">{formatIDR(totalExpense)}</div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#004b87]/20 outline-none w-full sm:w-64 transition-all"
                />
              </div>
              <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr className="text-slate-500">
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Description</th>
                  <th className="py-4 px-6 font-semibold">Category</th>
                  <th className="py-4 px-6 font-semibold">Type</th>
                  <th className="py-4 px-6 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(trx.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {trx.description}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        {trx.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {trx.type === "INCOME" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                          <ArrowDownRight className="w-3 h-3" /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100/50">
                          <ArrowUpRight className="w-3 h-3" /> Expense
                        </span>
                      )}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold whitespace-nowrap ${trx.type === "INCOME" ? "text-emerald-600" : "text-slate-900"}`}>
                      {trx.type === "INCOME" ? "+" : "-"}{formatIDR(trx.amount)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 text-white ${modalType === "INCOME" ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-rose-500 to-rose-600"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {modalType === "INCOME" ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  Add {modalType === "INCOME" ? "Income" : "Expense"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">Record a new transaction to your cash flow.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#004b87]/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Client Payment, Internet Bill"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#004b87]/20 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (IDR)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number" 
                      required
                      min="0"
                      placeholder="0"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#004b87]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Office, Salary"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#004b87]/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-slate-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold transition-colors shadow-md ${modalType === "INCOME" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}