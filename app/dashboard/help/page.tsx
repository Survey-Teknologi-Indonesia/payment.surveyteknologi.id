"use client";

import { useState, useEffect } from "react";
import {
  LifeBuoy,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquareText,
  Mail,
  User,
  Plus,
  X,
  Edit2,
} from "lucide-react";
import {
  fetchTicketsAction,
  submitTicketAction,
  updateTicketStatusAction,
} from "@/app/lib/ticketing/actions";

// Tipe data tiket sesuai tabel
type Ticket = {
  tickets_id: string;
  user: string;
  date: string;
  messages: string;
  status: string;
};

export default function HelpSupportPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // State untuk form
  const [issue, setIssue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State untuk tabel tiket
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const isAdmin = userEmail === "riocandra@surveyteknologi.id";

  useEffect(() => {
    // Ambil data user dari localStorage
    const email = localStorage.getItem("userEmail") || "";
    let name = localStorage.getItem("userName") || "";

    if (!name && email) {
      const namePart = email.replace("@surveyteknologi.id", "");
      name = namePart
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    setUserName(name || "User");
    setUserEmail(email);
  }, []);

  // Fetch tickets saat komponen dimuat atau userEmail berubah
  useEffect(() => {
    if (userEmail) {
      fetchTickets();
    }
  }, [userEmail]);

  const fetchTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await fetchTicketsAction(userEmail, userName);
      if (!res.success) throw new Error(res.error);

      setTickets((res.data as Ticket[]) || []);
    } catch (err: any) {
      console.error("Gagal mengambil tiket:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!issue.trim()) {
      setError("Silakan jelaskan kendala Anda terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setIsSuccess(false);

    try {
      const res = await submitTicketAction(userName, issue);

      if (!res.success) {
        throw new Error(res.error);
      }

      setIsSuccess(true);
      setIssue(""); // Reset form
      fetchTickets(); // Refresh tabel setelah submit

      // Hilangkan pesan sukses setelah 5 detik dan tutup modal
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting ticket:", err);
      setError(err.message || "Terjadi kesalahan saat mengirim tiket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setIsUpdatingStatus(ticketId);
    try {
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (!res.success) throw new Error(res.error);

      // Update state lokal agar cepat (optimistic update)
      setTickets(
        tickets.map((t) =>
          t.tickets_id === ticketId ? { ...t, status: newStatus } : t,
        ),
      );
    } catch (err: any) {
      console.error("Gagal update status:", err);
      alert("Gagal update status: " + err.message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "working":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "finished":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section (Unchanged as requested) */}
        <div className="relative overflow-hidden bg-[#121826] rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-[#004b87]/10">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-brand-cyan/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest text-[#00e5ff] uppercase backdrop-blur-md shadow-sm">
                <LifeBuoy size={14} /> Support Center
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Ada yang bisa
                <br />
                kami bantu?
              </h1>
              <p className="text-slate-300 max-w-lg text-sm md:text-base leading-relaxed font-medium">
                Kirimkan pertanyaan, keluhan, atau kendala teknis Anda. Tim
                support kami akan merespons dengan solusi secepatnya.
              </p>
            </div>

            <div className="hidden md:flex h-28 w-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl items-center justify-center transform rotate-3 hover:rotate-6 transition-all duration-500 shadow-2xl">
              <MessageSquareText
                size={48}
                className="text-[#00e5ff]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {isAdmin ? "Semua Tiket Kendala" : "Tiket Saya"}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#121826] text-white px-5 py-2.5 rounded-xl font-bold hover:scale-110 transition-transform duration-200 ease-in-out shadow-md"
          >
            <Plus size={14} />
            <p className="text-sm">Buat Tiket</p>
          </button>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">ID Tiket</th>
                  {/* <th className="px-6 py-4">Pengirim</th> */}
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Kendala</th>
                  <th className="px-6 py-4">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoadingTickets ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <Loader2
                        size={24}
                        className="animate-spin mx-auto mb-2"
                      />
                      Memuat data tiket...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      Belum ada tiket yang dibuat.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.tickets_id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {ticket.tickets_id.split("-")[0]}
                      </td>
                      <td className="px-6 py-4 font-medium">{ticket.user}</td>
                      <td className="px-6 py-4">
                        {/* {ticket.date instanceof Date
                          ? (ticket.date as Date).toLocaleDateString("id-ID")
                          : String(ticket.date).split("T")[0]} */}
                        {ticket.date
                          ? new Date(ticket.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td
                        className="px-6 py-4 max-w-xs truncate"
                        title={ticket.messages}
                      >
                        {ticket.messages}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeColor(ticket.status)} capitalize`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <select
                            disabled={isUpdatingStatus === ticket.tickets_id}
                            value={ticket.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                ticket.tickets_id,
                                e.target.value,
                              )
                            }
                            className="text-xs bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 disabled:opacity-50"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="working">Working</option>
                            <option value="finish">Finished</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form Tiket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Form Tiket Baru
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Lengkapi informasi di bawah ini.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {isSuccess && (
                <div className="mb-8 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="bg-emerald-100 p-2.5 rounded-full shrink-0 shadow-sm">
                    <CheckCircle2 className="text-emerald-600" size={24} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-emerald-800 text-lg">
                      Tiket Berhasil Terkirim!
                    </h4>
                    <p className="text-emerald-700/90 mt-1 font-medium">
                      Tim support akan segera meninjau kendala Anda.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="bg-red-100 p-2.5 rounded-full shrink-0 shadow-sm">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-red-800 text-lg">
                      Gagal mengirim tiket
                    </h4>
                    <p className="text-red-700/90 mt-1 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={userName}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Mail size={16} className="text-slate-400" />
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquareText size={16} className="text-slate-400" />
                      Deskripsi Kendala <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <textarea
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Jelaskan kendala Anda..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 outline-none transition-all resize-none font-medium text-slate-700 placeholder:font-normal"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2.5 bg-[#121826] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#004b87]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    {isSubmitting ? "Memproses..." : "Kirim Tiket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
