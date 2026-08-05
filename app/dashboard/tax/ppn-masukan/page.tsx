"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import CommingSoon from '../../comingsoon/page';

interface PpnMasukan {
  id: number;
  date: string;
  description: string;
  vendor_name: string;
  faktur_pajak_no: string;
  dpp: number;
  ppn_amount: number;
}

export default function PpnMasukanPage() {
  const [ppnMasukanList, setPpnMasukanList] = useState<PpnMasukan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formMasukan, setFormMasukan] = useState({ date: '', description: '', vendor_name: '', faktur_pajak_no: '', dpp: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { getPpnMasukan } = await import('@/app/lib/actions/taxActions');
      const resMasukan = await getPpnMasukan();
      if (resMasukan.success && resMasukan.data) {
        setPpnMasukanList(resMasukan.data.map((r: any) => ({
           ...r, 
           date: new Date(r.date).toLocaleDateString('en-GB'),
           dpp: Number(r.dpp),
           ppn_amount: Number(r.ppn_amount)
        })));
      }
    } catch (error) {
      console.error("Failed to load PPN Masukan", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMasukan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMasukan.date || !formMasukan.vendor_name || !formMasukan.faktur_pajak_no) return;
    try {
      const { addPpnMasukan } = await import('@/app/lib/actions/taxActions');
      const ppn = Math.round(formMasukan.dpp * 0.12);
      const res = await addPpnMasukan(formMasukan.date, formMasukan.description, formMasukan.vendor_name, formMasukan.faktur_pajak_no, formMasukan.dpp, ppn);
      if (res.success) {
        setFormMasukan({ date: '', description: '', vendor_name: '', faktur_pajak_no: '', dpp: 0 });
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteMasukan = async (id: number) => {
    try {
      const { deletePpnMasukan } = await import('@/app/lib/actions/taxActions');
      await deletePpnMasukan(id);
      loadData();
    } catch (e) { console.error(e); }
  };

  const totalPPNMasukan = ppnMasukanList.reduce((acc, item) => acc + item.ppn_amount, 0);
  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading Data PPN Masukan...</div>;
  }

  return (
    <CommingSoon />
  );
}
