"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const level = localStorage.getItem("userLevel");
    
    if (level === "level-d") {
      router.replace("/dashboard/projects/pln-es");
    } else {
      router.replace("/dashboard/projects");
    }
  }, [router]);

  return null;
}