---
title: Memulai
description: Panduan awal untuk menggunakan produk kami
---

# Memulai

Selamat datang di dokumentasi produk kami! Panduan ini akan membantu Anda memulai dengan cepat.

## Instalasi

Untuk menginstal produk, jalankan perintah berikut:

```bash
npm install my-product
```

## Konfigurasi Dasar

Buat file konfigurasi `config.json`:

```json
{
  "name": "Proyek Saya",
  "version": "1.0.0",
  "settings": {
    "theme": "light",
    "language": "id"
  }
}
```

## Menjalankan Aplikasi

Jalankan aplikasi dengan perintah:

```bash
npm start
```

Aplikasi akan tersedia di `http://localhost:3000`.

![Dashboard Aplikasi](/images/dashboard.png)

## Langkah Selanjutnya

- [Konfigurasi Lanjutan](/advanced/configuration.html)
- [Panduan Deployment](/advanced/deployment.html)
```

### Fitur Unik yang Diimplementasikan:
1. **Navigasi Otomatis**: Generate dari struktur folder
2. **Pencarian Real-time**: Dengan indeks yang dibuat saat build
3. **Mode Gelap/Terang**: Dengan penyimpanan preferensi
4. **Edit Halaman**: Tombol untuk langsung edit di GitHub
5. **Pagination Navigasi**: Antara halaman dokumentasi
6. **Image Lightbox**: Klik gambar untuk tampilan besar
7. **Syntax Highlighting**: Untuk blok kode
8. **Responsive Design**: Untuk perangkat mobile
9. **SEO Friendly**: Meta tags otomatis
10. **Front Matter Support**: Untuk metadata halaman

### Cara Deploy ke Cloudflare Pages:
1. Push semua file ke repository GitHub
2. Di Cloudflare Pages:
   - Koneksi ke repository GitHub
   - Build command: `npm install && npm run build`
   - Build output directory: `dist`
3. Deploy otomatis setiap push ke branch utama

### Cara Penggunaan:
1. Tambahkan file markdown di `src/pages`
2. Gunakan front matter untuk metadata:
   ```markdown
   ---
   title: Judul Halaman
   description: Deskripsi singkat
   ---
   ```
3. Jalankan `npm run build` untuk generate situs
4. Folder `dist` siap di-deploy

Sistem ini memberikan pengalaman dokumentasi yang modern dengan fitur lengkap namun tetap ringan dan mudah di-deploy ke Cloudflare Pages.
