<div align="center">

# PEKONGFAM — Web UMKM Keluarga Pekong

**Sistem manajemen bisnis & Point-of-Sale (POS) berbasis web untuk UMKM Keluarga Pekong**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## Tentang Aplikasi

**PEKONGFAM** adalah aplikasi web fullstack yang dirancang khusus untuk mengelola operasional bisnis UMKM **Keluarga Pekong**. Aplikasi ini berfungsi sebagai sistem **Point-of-Sale (POS)** untuk kasir dan **dashboard manajemen** untuk pemilik bisnis. Selain itu, tersedia juga **homepage** sebagai etalase digital yang menampilkan informasi dan menu restoran.

Aplikasi ini dibangun dengan pendekatan **role-based access control** dengan dua peran utama:

- **Staff (Kasir)** — Memproses transaksi, mengelola keranjang belanja, melihat produk, mendaftarkan membership pelanggan, dan mencetak struk.
- **Admin (Pemilik)** — Mengelola seluruh data produk, pesanan, voucher, melihat dashboard analitik, dan mengekspor laporan.

---

## Fitur Utama

### Homepage
- Landing page restoran dengan hero slideshow
- Menampilkan informasi menu dan kategori produk (Makanan, Minuman, Snack, Jasa, Lainnya)
- Navigasi responsif dengan navbar dan footer

### Panel Staff (Kasir / POS)
- **Katalog Produk** — Lihat daftar produk dengan pencarian dan filter
- **Keranjang Belanja** — Tambah produk ke keranjang dengan modal interaktif
- **Proses Transaksi** — Buat pesanan baru dengan kalkulasi otomatis (subtotal, pajak, diskon)
- **Membership** — Daftarkan dan kelola data pelanggan member
- **Voucher** — Lihat dan terapkan voucher yang tersedia ke transaksi
- **Cetak Struk** — Generate receipt / struk untuk setiap transaksi

### Panel Admin
- **Dashboard** — Ringkasan bisnis (total penjualan, jumlah pesanan, produk, pelanggan)
- **Analytics** — Visualisasi data penjualan dengan grafik (Recharts)
- **Manajemen Produk** — CRUD produk lengkap dengan upload gambar
- **Manajemen Pesanan** — Lihat semua pesanan dan update status (Pending → Paid → Cancelled)
- **Manajemen Voucher** — Buat, edit, hapus voucher diskon (Fixed / Percent)
- **Laporan Stok** — Export mutasi stok ke file Excel

---

## Tech Stack

| Layer            | Teknologi                                                     |
| ---------------- | ------------------------------------------------------------- |
| **Frontend**     | React 19, TypeScript, Vite 7, Tailwind CSS 4                  |
| **State**        | Zustand                                                       |
| **Routing**      | React Router DOM 7                                            |
| **Charts**       | Recharts                                                      |
| **Smooth Scroll**| Lenis                                                         |
| **HTTP Client**  | Axios                                                         |
| **Backend**      | Node.js, Express 4, TypeScript                                |
| **ORM**          | Prisma 5                                                      |
| **Database**     | PostgreSQL 15                                                 |
| **Cache/Queue**  | Redis 7, BullMQ                                               |
| **Auth**         | JWT (jsonwebtoken), bcryptjs                                   |
| **Validation**   | Zod                                                           |
| **File Upload**  | Multer                                                        |
| **Export**        | ExcelJS                                                       |
| **Security**     | Helmet, CORS                                                  |
| **DevOps**       | Docker, Docker Compose                                        |


## Database Schema

Aplikasi menggunakan **PostgreSQL** dengan **Prisma ORM**. Berikut model-model data utama:

| Model             | Deskripsi                                                        |
| ----------------- | ---------------------------------------------------------------- |
| **User**          | Pengguna sistem dengan role `ADMIN` atau `STAFF`                 |
| **Customer**      | Data pelanggan (opsional member) yang terdaftar di sistem        |
| **Product**       | Produk yang dijual, dikategorikan: Makanan, Minuman, Snack, Jasa, Lainnya |
| **Order**         | Transaksi pesanan dengan status: Pending, Paid, Cancelled, Failed |
| **OrderItem**     | Detail item dalam setiap pesanan (produk, quantity, harga)       |
| **Voucher**       | Voucher diskon bertipe Fixed atau Percent, dengan kuota & masa berlaku |
| **StockMutation** | Riwayat mutasi stok (IN, OUT, ADJUSTMENT) untuk audit trail      |

<div align="center">

**Dibuat oleh PekongFamily DEV**

</div>
