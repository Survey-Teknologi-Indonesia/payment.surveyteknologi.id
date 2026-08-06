"use server";

import { saveInvoiceData } from "./invoiceActions";
import { GoogleGenAI } from "@google/genai";

// Inisialisasi Google Gen AI (pastikan GEMINI_API_KEY sudah terpasang di .env.local kamu)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseInvoicePDF(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, message: "No file uploaded" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 1. Ekstrak teks mentah dari PDF
    const pdfParse = (await import("pdf-parse")).default;
    const textResult = await pdfParse(buffer);
    const rawText = textResult.text;
    
    // 2. Gunakan Gemini untuk mengekstrak data terstruktur dari teks mentah
    const prompt = `
      Anda adalah asisten akuntansi cerdas untuk PT Survey Teknologi Indonesia. 
      Analisis teks invoice berikut dan ekstrak informasi penting ke dalam format JSON murni (tanpa markdown backtick jika memungkinkan, atau parse JSON langsung) dengan key berikut:
      - invoice_id (string, contoh: "1001_STI/IMP/GPS/VI/2026")
      - customer (string, nama perusahaan klien)
      - date (string format YYYY-MM-DD)
      - dpp (integer, AMBIL PERSIS ANGKA di sebelah label "DPP NILAI LAIN NYA" pada teks invoice, jangan diubah atau dihitung ulang. Contoh jika tertulis 173,423,423 maka masukkan 173423423)
      - customer_address (string)
      - up (string, nama PIC)
      - phone (string)
      - items (array of object berisi rincian barang: item, description, qty, price, total)

      Teks Invoice:
      ${rawText}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash', // atau model yang sesuai
      contents: prompt,
      config: {
        responseMimeType: "application/json", // Memaksa output berupa JSON murni yang valid
      }
    });

    const parsedData = JSON.parse(response.text || "{}");

    // 3. Simpan ke Database Neon menggunakan fungsi yang sudah ada
    const addResult = await saveInvoiceData(
      parsedData.invoice_id || "INV-AI-" + Date.now().toString().slice(-6),
      parsedData.customer || "Unknown Customer",
      parsedData.date || new Date().toISOString().split('T')[0],
      parsedData.dpp || 0,
      parsedData.customer_address || "",
      parsedData.up || "",
      parsedData.phone || "",
      parsedData.items || []
    );

    if (addResult.success) {
        return { 
          success: true, 
          message: "PDF parsed with AI and saved successfully",
          data: parsedData
        };
    } else {
        return { success: false, message: "AI parsed but failed to save to database: " + addResult.error };
    }
    
  } catch (error) {
    console.error("Error AI parsing PDF:", error);
    return { success: false, message: "Failed to parse PDF with AI: " + (error instanceof Error ? error.message : String(error)) };
  }
}