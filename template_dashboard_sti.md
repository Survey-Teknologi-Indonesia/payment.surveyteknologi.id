# Survey Teknologi Indonesia (STI) Dashboard Theme Template

Dokumen ini adalah panduan desain dan *style guide* (template tema) yang digunakan untuk membangun antarmuka dashboard pada ekosistem aplikasi Survey Teknologi Indonesia (STI). Agen AI dapat menggunakan dokumen ini sebagai referensi utama untuk memastikan konsistensi visual, palet warna, dan elemen UI/UX saat membuat dashboard baru untuk peruntukan yang berbeda.

## 1. Identitas Brand & Tipografi
- **Nama Perusahaan:** Survey Teknologi Indonesia
- **Singkatan/Logo Text:** SURVEY TEKNOLOGI INDONESIA (huruf kapital, font tebal/extrabold, *tracking-wider*)
- **Font Family Utama:** Plus Jakarta Sans (`var(--font-jakarta)`), disusul oleh `system-ui`, `sans-serif`.

## 2. Palet Warna (Color Palette)

Tema ini mendukung transisi halus antara mode gelap (Dark Mode - *default fallback*) dan mode terang (Light Mode - dengan *class* `.light` pada `html`).

### Warna Utama (Brand Colors)
- **Brand Blue:** `#004b87` (Digunakan untuk tombol utama, gradient, background header, teks *highlight* pada mode terang)
- **Brand Cyan:** `#00a3e0` (Digunakan untuk aksen, hover efek, badge, indikator, gradient sekunder, border glow)

### Warna Latar & Permukaan (Background & Surfaces)
**Mode Gelap (Dark Mode):**
- **Background Utama:** `#090d16`
- **Background Card/Sidebar:** `#121826` (Biasanya dipadukan dengan opacity, misal `bg-[#121826]/95`)
- **Teks Utama:** `#f3f4f6` (putih/abu-abu terang)

**Mode Terang (Light Mode):**
- **Background Utama:** `#f8fafc` (Slate 50)
- **Background Card:** `#ffffff` (Putih murni dengan border `slate-100` atau `slate-200`)
- **Teks Utama:** `#0f172a` (Slate 900)

### Warna Semantik (Status & Indikator)
- **Success / Active (Emerald):** `#10b981` (Digunakan untuk status "On Track", tren positif, *cash in*, dot indikator online/pulse).
  - *Tailwind classes:* `text-emerald-600`, `bg-emerald-50`, `bg-emerald-400`.
- **Warning / Pending (Amber):** Digunakan untuk status "Pending", "Overdue", atau butuh perhatian.
  - *Tailwind classes:* `text-amber-600`, `bg-amber-50`, `text-amber-700`.
- **Danger / Error (Rose):** `#f43f5e` (Digunakan untuk status "At Risk", tren negatif, *cash out*, tombol logout).
  - *Tailwind classes:* `text-rose-600`, `bg-rose-50`, `bg-rose-500`.

## 3. Gaya UI & Efek Visual (UI/UX Principles)

Desain STI mengusung gaya modern, premium, dan dinamis. Berikut adalah karakteristik utamanya:

### a. Glassmorphism & Transparansi
- Elemen sering menggunakan background semi-transparan dengan efek *blur*.
- **Contoh Tailwind:** `bg-white/10 backdrop-blur-md`, `bg-black/60 backdrop-blur-sm`, `bg-[#121826]/95 backdrop-blur-xl`.
- Border transparan digunakan untuk memisahkan elemen: `border-white/10`.

### b. Gradients (Gradiasi)
- **Primary Gradient:** `bg-gradient-to-tr from-[#004b87] to-brand-cyan` (Untuk avatar, highlight menu, atau kartu utama).
- **Dark Card Gradient:** `bg-gradient-to-br from-slate-900 to-slate-800` (Untuk kartu metrik eksekutif).

### c. Radius Sudut (Border Radius)
- **Card & Container:** Sudut membulat besar menggunakan `rounded-2xl`.
- **Button, Badge, & Menu Item:** Menggunakan `rounded-xl` atau `rounded-lg`.
- **Avatar & Dot Indicator:** Menggunakan `rounded-full`.

### d. Bayangan & Glow (Shadows)
- **Kartu Biasa (Light Mode):** `shadow-sm`, `border border-slate-100`.
- **Kartu Penting (Dark/Highlight):** `shadow-xl`, shadow berwarna `shadow-brand-cyan/20`, atau `shadow-blue-900/20`.
- Efek *Glow* sering dibuat dengan memposisikan div blur di belakang elemen: `absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20`.

### e. Interaktivitas (Micro-animations)
- Transisi halus (minimal `duration-200` atau `duration-300`).
- Hover state pada kartu menyebabkan *scale-up* pada elemen dekoratif latar atau perubahan warna border.
- *Pulse Effect:* Indikator "Online" atau indikator sistem aktif (seperti dot di sebelah nama perusahaan) menggunakan animasi `animate-pulse`.

## 4. Panduan Komponen (Component Guide)

### Kartu Metrik (Metric Cards)
- **Struktur:** Background putih (atau gradient gelap), padding `p-6`, ikon di sudut (berada dalam kotak membulat `rounded-xl` dengan warna background transparan), label deskriptif, dan nilai angka yang ditonjolkan.
- **Hover:** Border berubah warna sesuai semantik (misal: `hover:border-amber-200`, `hover:border-indigo-200`) dengan elemen latar belakang transparan yang membesar (`group-hover:scale-110`).

### Menu Navigasi (Sidebar Items)
- **State Aktif:** Menggunakan gradient background yang tipis `bg-gradient-to-r from-brand-cyan/20 to-[#004b87]/30` dengan border tipis `border-brand-cyan/30`. Teks dan ikon menggunakan warna dominan (putih di dark mode, `#004b87` di light mode).
- **State Tidak Aktif:** Teks abu-abu (`text-gray-400`), berubah menjadi putih atau gelap saat di-*hover* (`hover:text-white hover:bg-white/5`).

### Badge Status (Pills)
- Ukuran kecil teks (`text-[10px]` atau `text-xs`), uppercase, `font-bold` atau `font-semibold`.
- Background sangat terang dari warna semantik dipadukan dengan teks yang lebih gelap (Misal: `bg-rose-100 text-rose-700` atau `bg-emerald-50 text-emerald-700`).

### Chart (Grafik)
- Jika menggunakan Recharts, gaya chart menghilangkan garis vertikal (axis grid), menggunakan stroke putus-putus untuk garis horizontal (`strokeDasharray="3 3"`).
- **Area Chart** menggunakan gradient fill (opacity `0.3` ke `0`) dengan garis (*stroke*) yang tegas (`strokeWidth={3}`).

## 5. Background Utility Khusus
Tema ini menyediakan *utility class* custom di `globals.css` untuk background grid ala teknologi:
- **`.bg-tech-grid`**: Memberikan latar belakang garis grid transparan menggunakan warna `brand-cyan` (0.04 opacity di mode gelap, 0.08 opacity di mode terang). Sangat cocok untuk latar belakang area canvas atau halaman overview.
