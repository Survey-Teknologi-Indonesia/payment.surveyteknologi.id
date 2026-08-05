"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Send,
  Circle,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import CommingSoon from "@/app/dashboard/comingsoon/page";

export default function KwitamsiPage({ params }: { params: Promise<{ id: string }> }) {
    return(
        <CommingSoon />
    )
}