"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Save,
  MapPin,
  ListChecks,
} from "lucide-react";
import {
  fetchAssetsAction,
  addAssetAction,
  updateAssetLocationAction,
} from "@/app/lib/actions/assetsActions";

type Asset = {
  id: string;
  name: string;
  quantity: number;
  location: string;
  created_at: string;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Status state
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAssetsAction();
      if (!res.success) throw new Error(res.error);
      setAssets(res.data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data assets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location.trim() || quantity <= 0) {
      setError("Silakan lengkapi semua data dengan benar.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setIsSuccess(false);

    try {
      const res = await addAssetAction(name, quantity, location);
      if (!res.success) throw new Error(res.error);

      setIsSuccess(true);
      setName("");
      setQuantity(1);
      setLocation("");
      
      fetchAssets();

      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting asset:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setEditingLocation(asset.location);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingLocation.trim()) return;
    
    setIsUpdating(true);
    try {
      const res = await updateAssetLocationAction(editingId, editingLocation);
      if (!res.success) throw new Error(res.error);
      
      // Update local state
      setAssets(assets.map(a => 
        a.id === editingId ? { ...a, location: editingLocation } : a
      ));
      setEditingId(null);
    } catch (err: any) {
      console.error("Gagal update lokasi:", err);
      alert("Gagal update lokasi: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-[#121826] rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-[#004b87]/10">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-brand-cyan/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest text-[#00e5ff] uppercase backdrop-blur-md shadow-sm">
                <ListChecks size={14} /> Inventaris STI
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Daftar Assets
              </h1>
              <p className="text-slate-300 max-w-lg text-sm md:text-base leading-relaxed font-medium">
                Kelola daftar aset inventaris seperti drone, mobil, dan peralatan survei lainnya dengan mudah. Pantau jumlah dan lokasi terkini.
              </p>
            </div>
            
            <div className="hidden md:flex h-28 w-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl items-center justify-center transform rotate-3 hover:rotate-6 transition-all duration-500 shadow-2xl">
              <Package size={48} className="text-[#00e5ff]" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            Daftar Assets
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#121826] text-white px-5 py-2.5 rounded-xl font-bold hover:scale-110 transition-transform duration-200 ease-in-out shadow-md"
          >
            <Plus size={14} /> 
            <p className="text-sm">Tambah Data Asset</p>
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16">No</th>
                  <th className="px-6 py-4">Nama Assets</th>
                  <th className="px-6 py-4">Jumlah</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                      Memuat data assets...
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Belum ada data asset.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset, index) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {asset.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                          {asset.quantity} Unit
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === asset.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingLocation}
                              onChange={(e) => setEditingLocation(e.target.value)}
                              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-medium text-slate-700">
                            <MapPin size={14} className="text-slate-400" />
                            {asset.location}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === asset.id ? (
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isUpdating}
                              className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-50"
                              title="Simpan"
                            >
                              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={isUpdating}
                              className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                              title="Batal"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(asset)}
                            className="p-2 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors font-medium text-xs"
                          >
                            <Edit2 size={14} /> Edit Lokasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah Asset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Tambah Data Asset</h2>
                <p className="text-slate-500 text-sm mt-1">Masukkan rincian asset baru.</p>
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
                <div className="mb-6 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="bg-emerald-100 p-2 rounded-full shrink-0 shadow-sm">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-emerald-800">Berhasil Disimpan!</h4>
                    <p className="text-emerald-700/90 text-sm mt-1 font-medium">Data asset berhasil ditambahkan.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="bg-red-100 p-2 rounded-full shrink-0 shadow-sm">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-red-800">Gagal menyimpan</h4>
                    <p className="text-red-700/90 text-sm mt-1 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Package size={16} className="text-slate-400" />
                    Nama Asset <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Drone DJI Mavic 3 / Mobil Hilux"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 outline-none transition-all font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 outline-none transition-all font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Kantor Pusat / Site Proyek A"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 outline-none transition-all font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2.5 bg-[#121826] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#004b87]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full justify-center"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {isSubmitting ? "Menyimpan..." : "Simpan Asset"}
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
