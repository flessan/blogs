---
title: Memulai
description: Panduan awal untuk menggunakan produk kami
---

# Memulai

Selamat datang di dokumentasi produk kami! Panduan ini akan membantu Anda memulai dengan cepat.

## Prasyarat

Sebelum memulai, pastikan Anda telah memenuhi prasyarat berikut:

- Node.js versi 14 atau lebih tinggi
- npm versi 6 atau lebih tinggi
- Akses internet untuk mengunduh dependensi

## Instalasi

Untuk menginstal produk, jalankan perintah berikut:

```bash
npm install our-product
```

:::info
Jika Anda menggunakan Yarn, Anda dapat menjalankan `yarn add our-product` sebagai gantinya.
:::

## Konfigurasi Dasar

Buat file konfigurasi `config.json` di root proyek Anda:

```json
{
  "name": "Proyek Saya",
  "version": "1.0.0",
  "settings": {
    "theme": "light",
    "language": "id",
    "debug": false
  }
}
```

## Menjalankan Aplikasi

Jalankan aplikasi dengan perintah:

```bash
npx our-product start
```

Aplikasi akan tersedia di `http://localhost:3000`.

:::warning
Jangan jalankan aplikasi sebagai root user untuk alasan keamanan.
:::

## Struktur Proyek

Setelah instalasi, proyek Anda akan memiliki struktur berikut:

```
my-project/
├── config.json
├── src/
│   ├── index.js
│   └── styles/
│       └── main.css
├── public/
│   └── index.html
└── package.json
```

## Langkah Selanjutnya

- [Konfigurasi Lanjutan](advanced/configuration.html)
- [Panduan Deployment](advanced/deployment.html)
- [API Reference](api/reference.html)

## Troubleshooting

Jika Anda mengalami masalah selama instalasi:

1. Pastikan semua prasyarat terpenuhi
2. Hapus folder `node_modules` dan jalankan `npm install` kembali
3. Periksa log error untuk informasi lebih detail

:::danger
Jangan mengubah file di dalam folder `node_modules` secara manual karena perubahan akan hilang saat instalasi ulang.
:::
