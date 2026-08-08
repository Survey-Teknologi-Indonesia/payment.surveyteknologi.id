"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Wallet,
  FileText,
  DollarSign,
  Tag,
  Calendar,
  Loader2,
} from "lucide-react";
import { fetchOpsAction, addOpsAction, deleteOpsAction } from "@/app/lib/actions/opsActions";

interface OperationalCost {
  ops_id: string;
  date: string | Date;
  item: string;
  total: number;
}

export default function OperationalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: "",
    category: "Transport",
    description: "",
    amount: 0,
  });

  const categories = [
    "Transport",
    "Meals",
    "Accommodation",
    "Equipment",
    "Others",
  ];

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOpsAction();
      if (res.success && res.data) {
        setCosts(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data operasional", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.description || form.amount <= 0) return;

    setIsSubmitting(true);
    try {
      const combinedItem = `${form.category} - ${form.description}`;
      const res = await addOpsAction(form.date, combinedItem, form.amount);
      if (res.success) {
        fetchCosts();
        setForm({ ...form, description: "", amount: 0 });
      } else {
        alert("Gagal menambahkan biaya: " + res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (costId: string) => {
    setDeletingId(costId);
    try {
      const res = await deleteOpsAction(costId);
      if (res.success) {
        setCosts(costs.filter((c) => c.ops_id !== costId));
      } else {
        alert("Gagal menghapus biaya: " + res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const totalCost = costs.reduce((acc, curr) => acc + Number(curr.total), 0);

  return (
    <div className="max-w-6xl mx-auto pb-24 text-slate-100 light:text-slate-900">
      {/* 2. Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-4xl text-white light:text-slate-900 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-brand-cyan" />
            Operational Cost
          </p>
          <p className="font-medium text-slate-400 light:text-slate-500 text-lg">
            Track and manage operational expenses for this project.
          </p>
        </div>
      </header>

      {/* 3. Summary Card */}
      <section className="mb-10">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121826]/90 to-[#090d16]/90 light:from-white light:to-slate-50 border border-slate-800/80 light:border-slate-200 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-400 light:text-slate-500 uppercase tracking-wider mb-1">
              Total Operational Cost
            </p>
            <p className="text-3xl font-bold text-brand-cyan">
              {formatIDR(totalCost)}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Form Add Cost */}
      <section className="mb-10">
        <div className="bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-white light:text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-cyan" />
            Add New Expense
          </h2>
          <form onSubmit={handleAddCost} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2.5 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 uppercase mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 uppercase mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Description
              </label>
              <input
                required
                type="text"
                placeholder="Expense description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 light:text-slate-500 uppercase mb-2 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Amount (Rp)
              </label>
              <input
                required
                type="number"
                min="0"
                placeholder="0"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#090d16]/80 light:bg-slate-50 border border-slate-700/80 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            </div>

            <div className="md:col-span-5 flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-[#090d16] font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSubmitting ? "Menambahkan..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 5. Table */}
      <section>
        <div className="bg-[#121826]/90 light:bg-white border border-slate-800/80 light:border-slate-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-5 border-b border-slate-800/80 light:border-slate-200 bg-[#090d16]/50 light:bg-slate-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-cyan" />
            <h2 className="font-bold text-white light:text-slate-900">Expense History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 light:text-slate-600">
              <thead className="text-xs text-slate-400 light:text-slate-500 uppercase bg-[#090d16]/80 light:bg-slate-50 border-b border-slate-800/80 light:border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Description</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Amount</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 light:divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
                        <p className="text-slate-400 light:text-slate-500 font-medium">Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : costs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Wallet className="w-10 h-10 text-slate-500/50 light:text-slate-300" />
                        <p className="text-slate-400 light:text-slate-500 font-medium">
                          No operational expenses recorded yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  costs.map((cost) => {
                    const itemParts = cost.item.split(" - ");
                    const cat = itemParts.length > 1 ? itemParts[0] : "Others";
                    const desc = itemParts.length > 1 ? itemParts.slice(1).join(" - ") : cost.item;
                    const dateDisplay = cost.date instanceof Date ? cost.date.toISOString().split("T")[0] : String(cost.date).split("T")[0];

                    return (
                      <tr key={cost.ops_id} className="hover:bg-white/5 light:hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{dateDisplay}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                            {cat}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-white light:text-slate-900">{desc}</td>
                        <td className="px-6 py-4 font-medium text-brand-cyan text-right whitespace-nowrap">
                          {formatIDR(cost.total)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(cost.ops_id)}
                            disabled={deletingId === cost.ops_id}
                            className="p-2 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === cost.ops_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
