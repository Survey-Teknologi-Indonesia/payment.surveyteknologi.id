"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UploadDocument() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are allowed.");
      return;
    }

    setIsUploading(true);

    try {
      const fileName = file.name;
      
      const { data, error } = await supabase.storage
        .from("sti")
        .upload(`oasis/${fileName}`, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting files with the same name
        });

      if (error) {
        console.error("Upload error:", error);
        alert(`Failed to upload: ${error.message}`);
      } else {
        // Refresh the page to show the new document
        router.refresh();
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
      >
        {isUploading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Upload size={18} />
        )}
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
}
