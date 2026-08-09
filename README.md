# 🌟 PT Survey Teknologi Indonesia — Enterprise Portal & Project Management Dashboard

> **Portal Enterprise Terintegrasi** untuk Manajemen Proyek Geospatial, Monitoring Keuangan, AI Invoice Parser, Kalkulator Pajak SPT, Interactive Gantt Scheduler, dan Inventaris Aset.

---

## 📑 Daftar Isi
1. [Tentang Aplikasi](#-tentang-aplikasi)
2. [Fitur Utama](#-fitur-utama)
3. [Teknologi & Arsitektur](#-teknologi--arsitektur)
4. [Prasyarat & Konfigurasi Lingkungan (.env)](#-prasyarat--konfigurasi-lingkungan-env)
5. [Instalasi & Menjalankan Proyek](#-instalasi--menjalankan-proyek)
6. [Struktur Database & Migrasi](#-struktur-database--migrasi)
7. [Panduan & Tutorial Penggunaan Dashboard](#-panduan--tutorial-penggunaan-dashboard)
   - [1. Autentikasi, Akses & Manajemen Profil](#1-autentikasi-akses--manajemen-profil)
   - [2. Projects Hub & Workspace Proyek (OASIS PLN ES)](#2-projects-hub--workspace-proyek-oasis-pln-es)
   - [3. Finance & Billings (Invoice Tracker & AI PDF Parser)](#3-finance--billings-invoice-tracker--ai-pdf-parser)
   - [4. Generator Dokumen & Cetak Invoice](#4-generator-dokumen--cetak-invoice)
   - [5. Manajemen Biaya Operasional (Operational Overview & Report)](#5-manajemen-biaya-operasional-operational-overview--report)
   - [6. Rekapitulasi Pajak & Ready SPT (DJP Online)](#6-rekapitulasi-pajak--ready-spt-djp-online)
   - [7. Interactive Scheduler & Gantt Chart Timeline](#7-interactive-scheduler--gantt-chart-timeline)
   - [8. Inventaris Aset & Peralatan Survei](#8-inventaris-aset--peralatan-survei)
   - [9. Manajemen Dokumen Cloud (Supabase Storage)](#9-manajemen-dokumen-cloud-supabase-storage)
   - [10. Help Desk & Support Ticketing](#10-help-desk--support-ticketing)
8. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
9. [Troubleshooting & FAQ](#-troubleshooting--faq)
10. [Lisensi & Kontak](#-lisensi--kontak)

---

## 🏢 Tentang Aplikasi

**PT Survey Teknologi Indonesia (STI) Enterprise Portal** dirancang khusus untuk mendukung operasional survey dan pemetaan geospatial berskala industri (seperti inspeksi transmisi SUTET PLN ES, proyek drone survei pertambangan, dan utilitas).

Aplikasi ini menggabungkan:
- **Pelacakan Keuangan Real-Time:** Monitoring invoice, otomatisasi DPP Nilai Lainnya + PPN 12%, dan integrasi AI Gemini untuk ekstraksi file PDF invoice otomatis.
- **Project Tracking & Workspace:** Executive summary proyek, peta lokasi satelit, Work Order (WO) tracking, dan serapan anggaran operasional (BOP).
- **Tax Readiness:** Rekap data transaksi otomatis yang siap diinput ke formulir e-Faktur dan SPT Masa PPN/PPh 23 DJP Online.
- **Productivity Tools:** Gantt Chart interaktif dengan fitur *drag & drop bar*, *working days calculation*, dan *fill handle* ala spreadsheet.

---

## ⚡ Fitur Utama

| Modul | Deskripsi Fitur |
|---|---|
| 🔐 **Authentication & Security** | Login korporat (`@surveyteknologi.id`), role-based redirection, enkripsi cookie session, toggle Dark/Light mode, dan pengajuan akses (`/request`). |
| 🗂️ **Projects Hub** | Workspace khusus proyek (misal: *OASIS PLN ES - Over-headlines Asset Surveillance & Inspection System*) lengkap dengan peta satelit dan timeline fase proyek. |
| 🤖 **AI Invoice Parser & Tracker** | Unggah invoice fisik PDF dan sistem secara otomatis mengekstrak nomor invoice, nama klien, tanggal, DPP, rincian barang menggunakan Google Gemini AI, lalu menyimpan ke database. |
| 🧾 **Invoice & Document Generator** | Pembuat invoice resmi berstandar STI dengan kalkulasi otomatis DPP Nilai Lainnya (11/12) + PPN 12%, validasi anti-duplikasi nomor invoice, dan format cetak PDF siap kirim. |
| 📊 **Operational Cost & Analytics** | Dashboard visualisasi serapan anggaran (Budget vs Actual) menggunakan Recharts pie chart dan pencatatan biaya operasional lapangan (Transport, Meals, Accommodation, Equipment). |
| 🏛️ **Tax Calculator & SPT Ready** | Rekapitulasi peredaran bruto (DPP), PPN Keluaran 12%, dan PPh 23 kredit pajak yang sinkron langsung dari data tagihan untuk kemudahan lapor pajak di DJP Online. |
| 📅 **Interactive Gantt Scheduler** | Timeline proyek dengan drag-and-drop bar per hari kerja (Senin-Jumat), resize durasi, reorder baris tugas, dan Excel-like autofill. |
| 🚁 **Asset & Equipment Tracker** | Pencatatan aset lapangan (Drone DJI Mavic, Mobil Operasional, Sensor Lidar), jumlah unit, dan update lokasi terkini secara *inline editing*. |
| 📁 **Project Documents Vault** | Integrasi Supabase Storage untuk mengunggah dan mengunduh laporan PDF inspeksi dengan *signed URL* yang aman. |
| 🎫 **Help & Support Ticketing** | Sistem tiket pengaduan kendala teknis internal dengan status workflow (`Submitted` ➔ `Working` ➔ `Finished`). |

---

## 🛠️ Teknologi & Arsitektur

- **Framework Frontend & Fullstack:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Visualisasi Data & Grafik:** [Recharts](https://recharts.org/)
- **Database Relasional:** [Neon Serverless PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **Cloud File Storage:** [Supabase Storage](https://supabase.com/) (`@supabase/ssr` & `@supabase/supabase-js`)
- **Artificial Intelligence:** [Google Gemini AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`) untuk ekstraksi PDF terstruktur
- **PDF Extraction Engine:** `pdf-parse`

---

## 🔑 Prasyarat & Konfigurasi Lingkungan (.env)

Pastikan sistem Anda telah terpasang:
- **Node.js:** Versi 20.x atau lebih baru
- **npm** / **yarn** / **pnpm** / **bun**

Buat file `.env` atau `.env.local` di root proyek dengan konfigurasi berikut:

```env
# Koneksi Database Neon PostgreSQL
DATABASE_URL="postgresql://username:password@ep-lively-shape-...neon.tech/neondb?sslmode=require"

# Kunci API Google Gemini (Digunakan untuk AI Invoice PDF Parser)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Kredensial Supabase (Untuk Dokumen Project Storage)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## 🚀 Instalasi & Menjalankan Proyek

1. **Clone repositori dan masuk ke direktori proyek:**
   ```bash
   git clone <repository-url>
   cd payment
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan migrasi database:**
   ```bash
   # Migrasi tabel invoice, pajak, & operasional
   node migrate.mjs

   # Migrasi tabel tambahan SPT pajak
   npx tsx migrate_tax.ts

   # Update kolom jabatan user
   node alter.mjs
   ```

4. **Jalankan server development:**
   ```bash
   npm run dev
   ```

5. **Buka di browser:**
   Akses [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Struktur Database & Migrasi

Aplikasi menggunakan skema PostgreSQL pada Neon DB dengan tabel-tabel utama:

```mermaid
erDiagram
    ACCOUNT ||--o{ TICKETS : submits
    ACCOUNT {
        string account_id PK
        string email
        string password
        string level
        string name
        string jabatan
    }
    INVOICES {
        int id PK
        string no_invoice UK
        string client_name
        date date
        numeric subtotal
        numeric dpp
        numeric ppn
        numeric pph
        string status
        json items
    }
    OPERATIONAL_COSTS {
        string ops_id PK
        date date
        string item
        numeric total
    }
    ASSETS {
        string id PK
        string name
        int quantity
        string location
        timestamp created_at
    }
    SCHEDULER_TASKS {
        string id PK
        string project_id
        string name
        date start_date
        date end_date
        int progress
        string assigned_to
        int sort_order
    }
    TICKETS {
        string tickets_id PK
        string user
        timestamp date
        string messages
        string status
    }
```

---

## 📖 Panduan & Tutorial Penggunaan Dashboard

### 1. Autentikasi, Akses & Manajemen Profil
- **Login Portal:**
  1. Masuk ke halaman `/login`.
  2. Masukkan alamat email korporat (contoh: `riocandra@surveyteknologi.id` atau `hindrawan@surveyteknologi.id`) dan password akun.
  3. Pilih tema **Light Mode** atau **Dark Mode** menggunakan tombol di pojok kanan atas.
  4. Klik **Sign In to Portal**.
- **Meminta Akses Baru (`/request`):**
  - Jika belum memiliki akun, klik tautan *"Request Access from IT Support"* di bawah form login.
  - Isi Nama Lengkap, Email, dan Alasan Kebutuhan Akses. Tiket permintaan akan otomatis diproses oleh IT Support.
- **Update Profil & Ganti Password (`/dashboard/profile`):**
  - Klik kartu profil di bagian bawah sidebar kiri untuk membuka halaman profil.
  - Anda dapat memperbarui Nama Lengkap, prefix email korporat, dan mengganti password akun.

---

### 2. Projects Hub & Workspace Proyek (OASIS PLN ES)
- **Mengakses Proyek:**
  - Buka menu **Projects Hub** di sidebar.
  - Klik pada kartu proyek (misalnya: **PLN ES**).
- **Fitur dalam Workspace Proyek:**
  - **Executive Summary:** Menampilkan metrik utama proyek, *Next Location*, *Total Span*, dan *Work Order Status*.
  - **Peta Lokasi Satelit:** Peta interaktif area operasi inspeksi saluran transmisi.
  - **Invoice & WO Tracking:** Monitoring nomor invoice terbit dan status pengerjaan span.
  - **Operational Stages:** Checklist tahapan proyek mulai dari *Survey Lokasi*, *Working Permit*, *Akuisisi Data (OASIS)*, *Data Processing*, hingga *BAPP & Penagihan*.

---

### 3. Finance & Billings (Invoice Tracker & AI PDF Parser)
Akses melalui menu: **Finance & Billings ➔ Invoice Tracker** (`/dashboard/finance&billings/invoiceTracker`).

#### A. Memantau Tagihan & Mengubah Status
- Kartu ringkasan menampilkan **Total Invoiced**, **Total Paid**, dan **Total Pending**.
- Untuk menandai tagihan yang telah dibayar oleh klien, klik tombol **Tandai Lunas** pada baris invoice yang bersangkutan.
- Klik **Lihat Detail** untuk memunculkan modal *preview* faktur invoice resmi secara lengkap.

#### B. Mengunggah Invoice PDF dengan AI Gemini Parser
1. Klik tombol **Import PDF** di pojok kanan atas halaman Invoice Tracker.
2. Pilih file PDF invoice resmi STI yang ingin dimasukkan ke database.
3. Klik **Process PDF**.
4. Sistem backend akan mengekstrak teks menggunakan `pdf-parse` dan menganalisis struktur data menggunakan **Google Gemini AI**.
5. Data berupa Nomor Invoice, Nama Klien, Tanggal, Rincian Pekerjaan, DPP Nilai Lainnya, dan PPN 12% akan otomatis tersimpan ke database tanpa perlu input manual.

---

### 4. Generator Dokumen & Cetak Invoice
Akses melalui menu: **Document ➔ Invoice Generator** (`/dashboard/documentGenerator/invoiceGenerator`).

```
┌──────────────────────────────────────────┐      ┌──────────────────────────────────────────┐
│             FORM INPUT INVOICE           │      │           LIVE PREVIEW & PRINT           │
│ 1. No Invoice & Tanggal                  │ ──>  │ - Kop Surat Resmi PT STI                 │
│ 2. Data Customer & Alamat                │      │ - Tabel Item Pekerjaan Otomatis          │
│ 3. Tambah Baris Item (Deskripsi, Qty, Rp)│      │ - Auto Calc DPP Nilai Lain + PPN 12%     │
│ 4. Klik "Download / Cetak PDF Invoice"   │      │ - Tanda Tangan Direktur Utama            │
└──────────────────────────────────────────┘      └──────────────────────────────────────────┘
```

1. **Isi Form Input:**
   - Masukkan **No. Invoice** (contoh: `012/STI-INV/X/2026`).
   - Masukkan **Tanggal Invoice**, **Nama Customer**, **Alamat Customer**, **UP**, dan **No. Telepon**.
2. **Kelola Item Pekerjaan:**
   - Masukkan *Deskripsi Pekerjaan*, *Qty / Luasan (HA / Span)*, dan *Harga Satuan (Rp)*.
   - Klik **Tambah Item** untuk menambah baris atau **Hapus Item** untuk mengurangi baris.
3. **Kalkulasi Pajak Otomatis:**
   - Sistem secara otomatis menghitung:
     $$\text{Subtotal} = \sum (\text{Qty} \times \text{Harga})$$
     $$\text{DPP Nilai Lainnya} = \text{round}\left(\frac{\text{Subtotal} \times 11}{12}\right)$$
     $$\text{PPN 12\%} = \text{round}(\text{DPP} \times 12\%)$$
     $$\text{Grand Total} = \text{Subtotal} + \text{PPN}$$
4. **Cetak / Simpan ke PDF:**
   - Klik tombol **Download / Cetak PDF Invoice**.
   - Sistem akan menyimpan record invoice ke database dan membuka dialog cetak browser (pilih opsi *Save as PDF*).

---

### 5. Manajemen Biaya Operasional (Operational Overview & Report)
Akses melalui:
- **Overview:** `Projects ➔ [Pilih Proyek] ➔ Operational ➔ Overview`
- **Report & Catat Pengeluaran:** `Projects ➔ [Pilih Proyek] ➔ Operational ➔ Operational Report`

1. **Melihat Ringkasan Anggaran:**
   - Pantau **Total Expense**, **Total Budget (Rp 100.000.000)**, dan **Remaining Budget**.
   - Visualisasi pie chart interaktif menampilkan persentase alokasi dana per kategori: *Transport*, *Meals*, *Accommodation*, *Equipment*, atau *Others*.
2. **Menambahkan Pengeluaran Lapangan:**
   - Pada halaman *Operational Report*, isi tanggal, pilih kategori biaya, masukkan deskripsi pengeluaran, dan nominal dalam Rupiah.
   - Klik **Add Expense**.
3. **Menghapus Pengeluaran:**
   - Klik tombol ikon tempat sampah (*Trash*) pada tabel riwayat transaksi jika terjadi kesalahan input data.

---

### 6. Rekapitulasi Pajak & Ready SPT (DJP Online)
Akses melalui menu: **Tax Calculator ➔ Tax Overview** (`/dashboard/tax`).

- **Fungsi Modul:**
  - Menghitung akumulasi **Peredaran Bruto (DPP)** dari seluruh invoice terbit.
  - Menghitung total **PPN Keluaran (12%)** yang siap dimasukkan ke formulir e-Faktur / SPT Masa PPN.
  - Menghitung estimasi **PPh Pasal 23 (2%)** yang dipotong oleh klien sebagai bukti potong kredit pajak pada SPT Tahunan Badan PT STI.
- **Ekspor Ringkasan:**
  - Klik tombol **Cetak / Ekspor Ringkasan SPT** untuk mencetak laporan rekapitulasi perpajakan masa berjalan.

---

### 7. Interactive Scheduler & Gantt Chart Timeline
Akses melalui menu: **Tools ➔ Scheduler** (`/dashboard/tools/scheduler`).

```
[+] Add Task ──> Edit Nama Tugas ──> Drag Bar Timeline di Gantt ──> Resize Durasi ──> [Save All]
```

- **Menambah & Menghapus Tugas:**
  - Klik **Add Task** untuk membuat baris tugas baru.
  - Ubah nama tugas langsung di kolom tabel sebelah kiri.
  - Klik ikon tempat sampah untuk menghapus tugas.
- **Interaksi Bar Gantt Chart:**
  - **Geser Bar:** Klik dan tahan bagian tengah bar biru untuk menggeser tanggal mulai (*Start Date*) dan tanggal selesai (*End Date*).
  - **Resize Durasi:** Klik dan tahan handle di ujung kiri atau kanan bar untuk memperpanjang atau memperpendek durasi hari kerja.
  - **Perhitungan Hari Kerja:** Timeline secara otomatis mengabaikan hari Sabtu dan Minggu (*5 working days/week*).
- **Excel-Style Fill Handle:**
  - Klik pada cell nama tugas dan tarik titik kotak kecil (*fill handle*) di pojok kanan bawah untuk menduplikasi teks ke baris bawahnya.
- **Menyimpan Perubahan:**
  - Klik tombol **Save All** di pojok kanan atas untuk menyimpan susunan jadwal ke database.

---

### 8. Inventaris Aset & Peralatan Survei
Akses melalui menu: **Assets** (`/dashboard/assets`).

- **Menambah Aset Baru:**
  1. Klik tombol **Tambah Data Asset**.
  2. Masukkan *Nama Asset* (contoh: `Drone DJI Mavic 3 Enterprise`, `Total Station Topcon`, `Mobil Toyota Hilux 4x4`).
  3. Masukkan *Jumlah Unit* dan *Lokasi Terkini* (contoh: `Site Proyek SUTET Jawa Timur` atau `Workshop Pusat`).
  4. Klik **Simpan Asset**.
- **Edit Lokasi Cepat (Inline Editing):**
  - Klik tombol **Edit Lokasi** pada baris aset yang diinginkan.
  - Ubah nama lokasi pada input field yang muncul, lalu klik ikon centang hijau (**Simpan**) untuk memperbarui lokasi secara instan.

---

### 9. Manajemen Dokumen Cloud (Supabase Storage)
Akses melalui: `Projects ➔ [Pilih Proyek] ➔ Documents` (`/dashboard/projects/pln-es/documents`).

- Dokumen laporan teknis dan inspeksi PDF tersimpan di bucket Supabase `sti/oasis`.
- Setiap file PDF dilengkapi dengan tautan aman (*Signed URL*) berdurasi 1 jam.
- Pengguna dapat melihat daftar dokumen, mengunduh file PDF secara langsung, atau mengunggah laporan baru ke direktori proyek.

---

### 10. Help Desk & Support Ticketing
Akses melalui menu footer: **Help & Support** (`/dashboard/help`).

- **Membuat Tiket Baru:**
  1. Klik tombol **Buat Tiket**.
  2. Nama dan Email pengirim akan terisi otomatis berdasarkan session login aktif.
  3. Tuliskan deskripsi kendala atau permintaan bantuan teknis pada kotak teks.
  4. Klik **Kirim Tiket**.
- **Manajemen Tiket (Khusus Admin):**
  - Akun administrator (`riocandra@surveyteknologi.id`) dapat melihat seluruh tiket dari seluruh staf dan memperbarui status tiket secara real-time via dropdown (**Submitted** ➔ **Working** ➔ **Finished**).

---

## 📁 Struktur Direktori Proyek

```
payment/
├── app/
│   ├── components/
│   │   └── layout/
│   │       └── sidebar.tsx              # Navigasi utama, sub-menu, & profile card
│   ├── dashboard/
│   │   ├── assets/                      # Modul inventaris aset
│   │   ├── comingsoon/                  # Halaman placeholder modul rilis mendatang
│   │   ├── documentGenerator/           # Modul generator invoice & proposal
│   │   │   └── invoiceGenerator/
│   │   ├── finance&billings/            # Modul keuangan
│   │   │   ├── billings/
│   │   │   ├── cashflow/
│   │   │   └── invoiceTracker/          # Tracker tagihan & AI PDF parser
│   │   ├── help/                        # Modul helpdesk & support ticketing
│   │   ├── overview/                    # Overview dashboard umum
│   │   ├── profile/                     # Manajemen profil user & ganti password
│   │   ├── projects/                    # Projects hub & workspace proyek (OASIS PLN)
│   │   │   └── [id]/                    # Sub-modul overview, invoice, operasional, & dokumen
│   │   ├── tax/                         # Modul kalkulator pajak & SPT Ready
│   │   └── tools/                       # Interactive Gantt scheduler
│   ├── lib/
│   │   ├── actions/                     # Server Actions (Invoice, Ops, Tax, Scheduler, AI)
│   │   ├── neon.ts                      # Konfigurasi koneksi Neon DB serverless
│   │   └── ticketing/                   # Server Actions sistem tiket bantuan
│   ├── login/                           # Halaman login portal & auth server actions
│   ├── request/                         # Halaman pengajuan tiket akses akun baru
│   ├── globals.css                      # Konfigurasi Tailwind CSS v4 & theme tokens
│   └── layout.tsx                       # Root layout aplikasi Next.js
├── public/
│   └── assets/image/                    # Logo resmi PT STI & aset visual
├── utils/
│   └── supabase/                        # Client, Server, & Middleware Supabase
├── middleware.ts                        # Route protection & token validation
├── migrate.mjs                          # Script migrasi tabel database awal
├── migrate_tax.ts                       # Script migrasi tabel perpajakan
├── alter.mjs                            # Script update skema akun & jabatan
├── package.json                         # Dependensi & script build
└── README.md                            # Dokumentasi resmi proyek
```

---

## ❓ Troubleshooting & FAQ

<details>
<summary><b>1. Mengapa fitur Import PDF di Invoice Tracker gagal memproses?</b></summary>
Pastikan Anda telah menambahkan <code>GEMINI_API_KEY</code> di dalam file <code>.env</code> / <code>.env.local</code>. Fitur ini membutuhkan API Google Gemini yang valid untuk membaca dan mengekstrak isi teks faktur ke format JSON terstruktur.
</details>

<details>
<summary><b>2. Mengapa tidak bisa mengakses halaman /dashboard dan selalu diarahkan ke /login?</b></summary>
Aplikasi menggunakan <code>middleware.ts</code> yang mengecek keberadaan cookie <code>auth_token</code>. Pastikan Anda telah melakukan login yang valid. Jika sesi kedaluwarsa, silakan login kembali.
</details>

<details>
<summary><b>3. Bagaimana cara menambahkan hak akses jabatan atau role baru?</b></summary>
Eksekusi script database <code>alter.mjs</code> atau jalankan query SQL langsung pada database Neon untuk memperbarui kolom <code>level</code> dan <code>jabatan</code> pada tabel <code>account</code>.
</details>

<details>
<summary><b>4. Bagaimana cara mengatur ukuran cetak Invoice agar pas di kertas A4?</b></summary>
Pada jendela dialog print browser, pilih ukuran kertas **A4**, orientasi **Portrait**, margin **Default** atau **None**, dan pastikan opsi **Background Graphics / Grafis Latar Belakang** dicentang agar kop surat dan warna tabel tampil sempurna.
</details>

---

## 📄 Lisensi & Hak Cipta

Dokumentasi dan sistem ini dikembangkan untuk internal operasional **PT Survey Teknologi Indonesia**. Seluruh hak cipta dilindungi undang-undang.

- **Perusahaan:** PT Survey Teknologi Indonesia
- **Alamat:** Perumahan Golden Galaxy INN Blok B No. 7, Jl. Waduk Tunggu Pampang, Kec. Manggala, Kota Makassar
- **Email:** [indosurtek@gmail.com](mailto:indosurtek@gmail.com)
- **Website:** [www.surveyteknologi.id](http://www.surveyteknologi.id)
