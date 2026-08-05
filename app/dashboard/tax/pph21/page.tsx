"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import CommingSoon from '../../comingsoon/page';

interface Pph21 {
  id: number;
  date: string;
  employee_name: string;
  gross_salary: number;
  tax_amount: number;
}

export default function Pph21Page() {
  const [pph21List, setPph21List] = useState<Pph21[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formPph21, setFormPph21] = useState({ date: '', employee_name: '', gross_salary: 0, tax_amount: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { getPph21 } = await import('@/app/lib/actions/taxActions');
      const resPph21 = await getPph21();
      if (resPph21.success && resPph21.data) {
        setPph21List(resPph21.data.map((r: any) => ({
           ...r, 
           date: new Date(r.date).toLocaleDateString('en-GB'),
           gross_salary: Number(r.gross_salary),
           tax_amount: Number(r.tax_amount)
        })));
      }
    } catch (error) {
      console.error("Failed to load PPh 21 data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPph21 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPph21.date || !formPph21.employee_name) return;
    try {
      const { addPph21 } = await import('@/app/lib/actions/taxActions');
      const res = await addPph21(formPph21.date, formPph21.employee_name, formPph21.gross_salary, formPph21.tax_amount);
      if (res.success) {
        setFormPph21({ date: '', employee_name: '', gross_salary: 0, tax_amount: 0 });
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeletePph21 = async (id: number) => {
    try {
      const { deletePph21 } = await import('@/app/lib/actions/taxActions');
      await deletePph21(id);
      loadData();
    } catch (e) { console.error(e); }
  };

  const totalPPh21 = pph21List.reduce((acc, item) => acc + item.tax_amount, 0);
  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading Data PPh 21...</div>;
  }

  return (
    <CommingSoon />
  );
}
