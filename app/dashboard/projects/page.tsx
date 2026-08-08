"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Plus, ChevronRight, Briefcase, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Dummy Data for Projects
const projects = [
  {
    id: "pln-es",
    client: "OASIS",
    name: "PLN ES",
    image : "https://upload.wikimedia.org/wikipedia/commons/2/20/Logo_PLN.svg"
  },
  // {
  //   id: "vale",
  //   client: "VALE",
  //   name: "VALE",
  //   image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfyg8kyQlqHEU1ho0uUN9fbpe9hZFXQnj5AZrfKWCD&s=10"
  // },
  
];

export default function ProjectsHubPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const level = localStorage.getItem("userLevel");
    if (level === "level-d") {
      router.replace("/dashboard/projects/pln-es");
    }
  }, [router]);

  const filteredProjects = projects.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 2. Header & Quick Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-cyan" />
            Projects Hub
          </h1>
          <p className="text-sm text-gray-400 light:text-slate-500 mt-1">
            Pilih workspace proyek untuk melihat progress dan mengelola penagihan.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">

        </div>
      </div>

      {/* 3. Project Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
            <div className="flex items-center justify-center bg-[#121826]/80 light:bg-white border border-white/10 light:border-slate-200 rounded-xl px-6 py-10 hover:scale-105 hover:border-white/30 transition-all group cursor-pointer h-48">
              
              {/* Simple Avatar/Logo */}
              <Image 
                src={project.image}
                width={170}
                height={170}
                className="object-contain w-auto h-full max-h-[120px] transition-transform duration-300 group-hover:scale-110"
                unoptimized
                alt={project.name}
              />

              {/* <div className="">
                <h3 className="text-sm font-medium text-white light:text-slate-900 truncate">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {project.client}
                </p>
              </div> */}

            </div>
          </Link>
        ))}
      </div>
      
      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <Briefcase className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Tidak ada proyek ditemukan</h3>
          <p className="text-sm text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
        </div>
      )}

    </div>
  );
}
